"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreator, getPublishReadiness, publishGateMessage, creatorModeError } from "@/lib/creator";
import { JOURNEY_CATEGORIES } from "@/lib/constants/categories";
import { DISCOVERY_PHASE_DAYS, PUBLICLY_REACHABLE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { notifyNewJourney } from "@/lib/notifications";
import { deleteImage, deleteVideo, getImagePlaybackUrl, getImageUploadUrl, newImageKey } from "@/lib/r2";
import { ALLOWED_IMAGE_TYPES } from "@/lib/constants/image";
import { moderateImageUrl, moderateText, MODERATION_REJECTION_MESSAGE } from "@/lib/moderation";

async function requireOwnedJourney(journeyId: string) {
  const { creator } = await requireCreator();
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: { creator: { include: { user: true } } },
  });
  if (!journey || journey.creatorId !== creator.id || journey.deletedAt) notFound();
  return journey;
}

// I nuovi Journey vanno in cima alla lista del Profilo (stesso comportamento visivo di prima,
// quando l'ordine era per data di creazione discendente): prendono un valore più piccolo del
// più piccolo esistente, invece di essere accodati in fondo come capitoli/episodi.
export async function nextJourneyOrder(creatorId: string): Promise<number> {
  const firstJourney = await prisma.journey.findFirst({
    where: { creatorId, deletedAt: null },
    orderBy: { order: "asc" },
  });
  return (firstJourney?.order ?? 0) - 1;
}

const JourneySchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters long.").max(100),
  description: z.string().trim().max(2000).optional(),
  category: z.enum(JOURNEY_CATEGORIES).optional(),
  tags: z.string().trim().max(200).optional(),
  coverKey: z.string().trim().optional(),
});

// Genera l'URL temporaneo con cui il browser carica la copertina direttamente su R2 (stesso
// meccanismo del video degli episodi, vedi createEpisodeVideoUploadUrl in lib/actions/episode.ts).
// Richiede un Journey già esistente: a differenza dei "cover" finti del mockup Lovable (scelti da
// una manciata di foto stock), qui la foto è reale e va caricata dopo che il Journey esiste già.
export async function createJourneyCoverUploadUrl(
  journeyId: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string } | { error: string }> {
  await requireOwnedJourney(journeyId);

  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return { error: "Unsupported image format." };
  }

  const key = newImageKey("journey-covers", contentType);
  const uploadUrl = await getImageUploadUrl(key, contentType);
  return { uploadUrl, key };
}

function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export async function createJourney(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { creator } = await requireCreator();
  const modeError = await creatorModeError(creator.userId);
  if (modeError) return { error: modeError };

  const parsed = JourneySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  // Primo filtro automatico (lib/moderation.ts, Gemini): se il servizio non risponde, il contenuto viene pubblicato comunque.
  const moderation = await moderateText(`${parsed.data.title}\n${parsed.data.description ?? ""}`);
  if (moderation.flagged) return { error: MODERATION_REJECTION_MESSAGE };

  const journey = await prisma.journey.create({
    data: {
      creatorId: creator.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      tags: parseTags(parsed.data.tags),
      order: await nextJourneyOrder(creator.id),
    },
  });

  redirect(`/dashboard/journeys/${journey.id}`);
}

export async function updateJourney(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const journeyId = formData.get("journeyId");
  if (typeof journeyId !== "string" || !journeyId) {
    return { error: "Invalid journey." };
  }
  const journey = await requireOwnedJourney(journeyId);

  const parsed = JourneySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    tags: formData.get("tags") || undefined,
    coverKey: formData.get("coverKey") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  // Primo filtro automatico (lib/moderation.ts, Gemini): se il servizio non risponde, il contenuto viene pubblicato comunque.
  const moderation = await moderateText(`${parsed.data.title}\n${parsed.data.description ?? ""}`);
  if (moderation.flagged) return { error: MODERATION_REJECTION_MESSAGE };

  const newCoverKey = parsed.data.coverKey || null;
  const replacesCover = newCoverKey !== null && newCoverKey !== journey.coverUrl;

  if (replacesCover) {
    const coverPlaybackUrl = await getImagePlaybackUrl(newCoverKey);
    const coverModeration = await moderateImageUrl(coverPlaybackUrl);
    if (coverModeration.flagged) {
      await deleteImage(newCoverKey);
      return { error: MODERATION_REJECTION_MESSAGE };
    }
  }

  await prisma.journey.update({
    where: { id: journey.id },
    data: {
      title: parsed.data.title,
      // Explicitly null (not undefined) so clearing a field in the form clears it in the database too —
      // Prisma treats `undefined` as "leave unchanged" on update, unlike on create.
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? null,
      tags: parseTags(parsed.data.tags),
      ...(replacesCover ? { coverUrl: newCoverKey } : {}),
    },
  });

  // Il vecchio file resta orfano su R2 se non viene ripulito qui: nessun'altra riga lo referenzia più.
  if (replacesCover && journey.coverUrl) {
    await deleteImage(journey.coverUrl);
  }

  revalidatePath(`/dashboard/journeys/${journey.id}`);
  redirect(`/dashboard/journeys/${journey.id}`);
}

export async function publishJourney(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const journeyId = formData.get("journeyId");
  if (typeof journeyId !== "string" || !journeyId) {
    return { error: "Invalid journey." };
  }
  const journey = await requireOwnedJourney(journeyId);

  if (journey.status !== "DRAFT") {
    return { error: "Only a Draft Journey can be published." };
  }

  const readiness = await getPublishReadiness();
  if (!readiness.ready) {
    return { error: publishGateMessage(readiness.missing) };
  }

  const issues: string[] = [];
  if (!journey.description || journey.description.trim().length === 0) {
    issues.push("your story, in a few words");
  }
  const episodeCount = await prisma.episode.count({
    where: {
      deletedAt: null,
      journeyId: journey.id,
      publishedAt: { not: null },
      OR: [{ chapterId: null }, { chapter: { deletedAt: null } }],
    },
  });
  if (episodeCount === 0) {
    issues.push("at least one published Episode (not just a Draft)");
  }
  if (issues.length > 0) {
    return { error: `Before publishing, add: ${issues.join(", ")}.` };
  }

  await applyJourneyPublish(journey);

  revalidatePath(`/dashboard/journeys/${journey.id}`);
  revalidatePath(`/journeys/${journey.id}`);
  return { error: null };
}

// Discovery Phase (08_Algorithm.md): un Journey pubblicato per la prima volta entra in DISCOVERY
// per 15 giorni (discoveryEndsAt), visibile a tutti indipendentemente dagli interessi. Sia
// publishedAt sia discoveryEndsAt si valorizzano una sola volta, mai ricalcolati: un ciclo
// bozza→ripubblica non riporta il Journey in Discovery una seconda volta (evita che un creator
// possa "resettare" la finestra di massima visibilità pubblicando e spubblicando a ripetizione).
// Se discoveryEndsAt esiste già ed è nel passato, la Discovery Phase è già stata vissuta: si
// ripubblica direttamente come PUBLISHED. Condivisa tra `publishJourney` (Dashboard, esplicito) e
// `autoPublishDraftJourney` (caricamento veloce dal "+" globale).
async function applyJourneyPublish(
  journey: Awaited<ReturnType<typeof requireOwnedJourney>>
): Promise<void> {
  const alreadyHadDiscoveryPhase = journey.discoveryEndsAt !== null && journey.discoveryEndsAt <= new Date();
  const discoveryEndsAt =
    journey.discoveryEndsAt ?? new Date(Date.now() + DISCOVERY_PHASE_DAYS * 24 * 60 * 60 * 1000);
  const isFirstPublish = journey.publishedAt === null;

  await prisma.journey.update({
    where: { id: journey.id },
    data: {
      status: alreadyHadDiscoveryPhase ? "PUBLISHED" : "DISCOVERY",
      publishedAt: journey.publishedAt ?? new Date(),
      discoveryEndsAt,
    },
  });

  // Solo alla prima pubblicazione: un ciclo bozza→ripubblica non deve avvisare i follower
  // una seconda volta per lo stesso Journey (stesso principio già in uso per publishedAt/discoveryEndsAt).
  if (isFirstPublish) {
    await notifyNewJourney({
      creatorId: journey.creatorId,
      creatorName: journey.creator.displayName,
      journeyId: journey.id,
      journeyTitle: journey.title,
    });
  }
}

// Il caricamento veloce dal "+" globale (vedi components/creator/QuickUploadButton.tsx) dice
// "Publish" ma prima pubblicava solo l'Episodio, lasciando il Journey invisibile in Draft senza
// avvisare l'utente — questa funzione pubblica anche il Journey nella stessa azione, usando la
// caption/il titolo dell'episodio come descrizione breve se il Journey non ne ha ancora una (il
// campo è obbligatorio per pubblicare, vedi publishJourney sopra). Nessun controllo sul conteggio
// episodi pubblicati: chi chiama questa funzione lo fa subito dopo aver creato un episodio
// pubblicato, quindi il requisito è già soddisfatto.
export async function autoPublishDraftJourney(journeyId: string, fallbackDescription: string): Promise<void> {
  const journey = await requireOwnedJourney(journeyId);
  if (journey.status !== "DRAFT") return;

  if (!journey.description || journey.description.trim().length === 0) {
    await prisma.journey.update({
      where: { id: journey.id },
      data: { description: fallbackDescription.trim().slice(0, 2000) },
    });
  }

  await applyJourneyPublish(journey);

  revalidatePath(`/dashboard/journeys/${journey.id}`);
  revalidatePath(`/journeys/${journey.id}`);
}

export async function unpublishJourney(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const journeyId = formData.get("journeyId");
  if (typeof journeyId !== "string" || !journeyId) {
    return { error: "Invalid journey." };
  }
  const journey = await requireOwnedJourney(journeyId);

  if (journey.status !== "PUBLISHED" && journey.status !== "DISCOVERY") {
    return { error: "Only a published Journey can be moved back to Draft." };
  }

  await prisma.journey.update({
    where: { id: journey.id },
    data: { status: "DRAFT" },
  });

  revalidatePath(`/dashboard/journeys/${journey.id}`);
  revalidatePath(`/journeys/${journey.id}`);
  return { error: null };
}

// Archiving is one-way in the MVP: no action ever moves a Journey out of
// ARCHIVED again. A creator with an archived Journey is free to start a new
// one (see createJourney), and the archived Journey stays visible on the
// creator's public profile (never deleted).
export async function archiveJourney(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const journeyId = formData.get("journeyId");
  if (typeof journeyId !== "string" || !journeyId) {
    return { error: "Invalid journey." };
  }
  const journey = await requireOwnedJourney(journeyId);

  if (journey.status === "ARCHIVED") {
    return { error: "This Journey is already archived." };
  }

  await prisma.journey.update({
    where: { id: journey.id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/journeys/${journey.id}`);
  revalidatePath(`/journeys/${journey.id}`);
  return { error: null };
}

// Diverso da Archive: Delete rimuove il Journey per sempre, anche dal profilo pubblico (Archive
// invece lo ritira solo dalla gestione attiva, restando visibile pubblicamente). Cancellazione
// vera (non soft delete): porta con sé Capitoli, Episodi e tutti i relativi video/copertine su
// Cloudflare R2, incluso il coverUrl del Journey stesso — è il punto dove più spazio si accumulava
// inutilmente, dato che un Journey può avere molti episodi. Stessa logica di cleanup di
// deleteChapter/deleteEpisode in lib/actions/chapter.ts e lib/actions/episode.ts, applicata a
// tutto il Journey in un colpo solo.
export async function deleteJourney(formData: FormData): Promise<void> {
  const journeyId = formData.get("journeyId");
  if (typeof journeyId !== "string" || !journeyId) notFound();
  const journey = await requireOwnedJourney(journeyId);

  const episodes = await prisma.episode.findMany({
    where: { journeyId: journey.id },
    select: { id: true, videoKey: true, posterKey: true },
  });
  const episodeIds = episodes.map((episode) => episode.id);

  await prisma.$transaction([
    prisma.episodeProgress.deleteMany({ where: { episodeId: { in: episodeIds } } }),
    prisma.like.deleteMany({ where: { targetType: "EPISODE", targetId: { in: episodeIds } } }),
    prisma.update.updateMany({ where: { linkedEpisodeId: { in: episodeIds } }, data: { linkedEpisodeId: null } }),
    prisma.update.updateMany({ where: { linkedJourneyId: journey.id }, data: { linkedJourneyId: null } }),
    prisma.journeyProgress.deleteMany({ where: { journeyId: journey.id } }),
    prisma.analytics.deleteMany({ where: { journeyId: journey.id } }),
    prisma.episode.deleteMany({ where: { journeyId: journey.id } }),
    prisma.chapter.deleteMany({ where: { journeyId: journey.id } }),
    prisma.journey.delete({ where: { id: journey.id } }),
  ]);

  await Promise.all([
    ...episodes.flatMap((episode) => [
      episode.videoKey ? deleteVideo(episode.videoKey) : Promise.resolve(),
      episode.posterKey ? deleteImage(episode.posterKey) : Promise.resolve(),
    ]),
    journey.coverUrl ? deleteImage(journey.coverUrl) : Promise.resolve(),
  ]);

  revalidatePath("/dashboard");
  revalidatePath(`/profile/${journey.creator.userId}`);
  if (journey.creator.user.username) revalidatePath(`/profile/${journey.creator.user.username}`);
  redirect("/dashboard");
}

// Riordino manuale dei Journey nel Profilo (menu "..." -> Move Back/Move Forward): stessa
// tecnica di scambio con il vicino già usata per gli episodi (vedi moveEpisode in
// lib/actions/episode.ts). Il gruppo di "vicini" è esattamente l'elenco di Journey mostrato sul
// Profilo pubblico (PUBLICLY_REACHABLE_JOURNEY_STATUSES): i Draft non sono visibili lì, quindi
// non devono interferire con le posizioni.
export async function moveJourney(journeyId: string, direction: "up" | "down"): Promise<void> {
  const journey = await requireOwnedJourney(journeyId);

  const siblings = await prisma.journey.findMany({
    where: { creatorId: journey.creatorId, status: { in: PUBLICLY_REACHABLE_JOURNEY_STATUSES }, deletedAt: null },
    orderBy: { order: "asc" },
  });
  const index = siblings.findIndex((sibling) => sibling.id === journey.id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  const target = siblings[targetIndex];

  if (target) {
    await prisma.$transaction([
      prisma.journey.update({ where: { id: journey.id }, data: { order: target.order } }),
      prisma.journey.update({ where: { id: target.id }, data: { order: journey.order } }),
    ]);
  }

  revalidatePath(`/profile/${journey.creator.userId}`);
  if (journey.creator.user.username) revalidatePath(`/profile/${journey.creator.user.username}`);
}
