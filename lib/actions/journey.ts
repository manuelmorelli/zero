"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { requireSession } from "@/lib/session";
import { JOURNEY_CATEGORIES } from "@/lib/constants/categories";
import { DISCOVERY_PHASE_DAYS, PUBLICLY_REACHABLE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { notifyNewJourney } from "@/lib/notifications";
import { deleteImage, getImageUploadUrl, newImageKey } from "@/lib/r2";
import { ALLOWED_IMAGE_TYPES } from "@/lib/constants/image";

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
async function nextJourneyOrder(creatorId: string): Promise<number> {
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

  const parsed = JourneySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

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

// Passo "new journey" del pulsante "+" globale (vedi components/creator/QuickUploadButton.tsx):
// crea sempre un nuovo Journey con solo il titolo, senza passare dalla Dashboard né da "Become a
// creator" — se manca anche il profilo Creator viene creato al volo (nome dell'account come
// displayName di partenza, modificabile in seguito dal Profilo). Nessun redirect: il flusso resta
// nello stesso riquadro e passa allo step successivo (caricare il video). Un creator può avere più
// Journey attivi in parallelo (vedi 00-project-context.md, sezione "Archiviazione del Journey"),
// quindi qui non c'è più nessun controllo "ne hai già uno": si crea sempre.
const QuickJourneySchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters long.").max(100),
});

export type QuickJourneyState = { error: string | null; journeyId: string | null };

export async function quickStartJourney(
  _prevState: QuickJourneyState,
  formData: FormData
): Promise<QuickJourneyState> {
  const { user } = await requireSession();

  let creator = await prisma.creator.findUnique({ where: { userId: user.id } });
  if (!creator) {
    creator = await prisma.creator.create({ data: { userId: user.id, displayName: user.name } });
  }

  const parsed = QuickJourneySchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data.", journeyId: null };
  }

  const journey = await prisma.journey.create({
    data: { creatorId: creator.id, title: parsed.data.title, order: await nextJourneyOrder(creator.id) },
  });

  revalidatePath("/dashboard");
  return { error: null, journeyId: journey.id };
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
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const newCoverKey = parsed.data.coverKey || null;
  const replacesCover = newCoverKey !== null && newCoverKey !== journey.coverUrl;

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

  const issues: string[] = [];
  if (!journey.description || journey.description.trim().length === 0) {
    issues.push("a Presentation");
  }
  const episodeCount = await prisma.episode.count({
    where: {
      deletedAt: null,
      journeyId: journey.id,
      OR: [{ chapterId: null }, { chapter: { deletedAt: null } }],
    },
  });
  if (episodeCount === 0) {
    issues.push("at least one Episode");
  }
  if (issues.length > 0) {
    return { error: `Before publishing, add: ${issues.join(", ")}.` };
  }

  // Discovery Phase (08_Algorithm.md): un Journey pubblicato per la prima volta entra in
  // DISCOVERY per 15 giorni (discoveryEndsAt), visibile a tutti indipendentemente dagli interessi.
  // Sia publishedAt sia discoveryEndsAt si valorizzano una sola volta, mai ricalcolati: un ciclo
  // bozza→ripubblica non riporta il Journey in Discovery una seconda volta (evita che un creator
  // possa "resettare" la finestra di massima visibilità pubblicando e spubblicando a ripetizione).
  // Se discoveryEndsAt esiste già ed è nel passato, la Discovery Phase è già stata vissuta: si
  // ripubblica direttamente come PUBLISHED.
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

  revalidatePath(`/dashboard/journeys/${journey.id}`);
  revalidatePath(`/journeys/${journey.id}`);
  return { error: null };
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
// invece lo ritira solo dalla gestione attiva, restando visibile pubblicamente). Soft delete
// (deletedAt), stesso meccanismo già usato per Capitoli ed Episodi — Capitoli/Episodi/Progressi
// legati restano nel database ma smettono di comparire ovunque grazie ai filtri `deletedAt: null`
// già presenti in ogni query che li legge.
export async function deleteJourney(formData: FormData): Promise<void> {
  const journeyId = formData.get("journeyId");
  if (typeof journeyId !== "string" || !journeyId) notFound();
  const journey = await requireOwnedJourney(journeyId);

  await prisma.journey.update({
    where: { id: journey.id },
    data: { deletedAt: new Date() },
  });

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
