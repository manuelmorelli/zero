"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import {
  deleteImage,
  deleteVideo,
  getImageUploadUrl,
  getVideoSize,
  getVideoUploadUrl,
  newImageKey,
  newVideoKey,
} from "@/lib/r2";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from "@/lib/constants/video";
import { ALLOWED_IMAGE_TYPES } from "@/lib/constants/image";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { notifyNewEpisode } from "@/lib/notifications";

const EpisodeSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters long.").max(100),
    caption: z.string().trim().max(10000).optional(),
    videoKey: z.string().trim().max(500).optional().or(z.literal("")),
    posterKey: z.string().trim().optional(),
    durationSec: z.coerce.number().int().positive().optional(),
    occurredAt: z
      .string()
      .trim()
      .min(1, "Let us know when this episode happened.")
      .pipe(z.coerce.date({ message: "Invalid date." })),
  })
  .refine((data) => data.caption || data.videoKey, {
    message: "Add a caption or upload a video.",
    path: ["caption"],
  });

async function requireOwnedJourney(journeyId: string) {
  const { creator } = await requireCreator();
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: { creator: true },
  });
  if (!journey || journey.creatorId !== creator.id) notFound();
  return journey;
}

async function requireOwnedEpisode(episodeId: string) {
  const { creator } = await requireCreator();
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: { journey: true },
  });
  if (!episode || episode.journey.creatorId !== creator.id) notFound();
  return episode;
}

// Il Capitolo è un livello organizzativo opzionale (05_Journey.md): un chapterId
// vuoto/assente è valido e significa "nessun capitolo". Quando è presente, deve
// comunque appartenere allo stesso Journey posseduto dal creator.
async function resolveChapterId(rawChapterId: FormDataEntryValue | null, journeyId: string): Promise<string | null> {
  if (typeof rawChapterId !== "string" || rawChapterId === "") return null;
  const { creator } = await requireCreator();
  const chapter = await prisma.chapter.findUnique({
    where: { id: rawChapterId },
    include: { journey: true },
  });
  if (!chapter || chapter.journey.creatorId !== creator.id || chapter.journeyId !== journeyId) {
    notFound();
  }
  return rawChapterId;
}

// Genera l'URL temporaneo con cui il browser carica il file direttamente su R2,
// senza farlo transitare dal nostro server (evita il limite di 1MB delle Server Action).
export async function createEpisodeVideoUploadUrl(
  ownerId: string,
  ownerType: "journey" | "episode",
  contentType: string
): Promise<{ uploadUrl: string; key: string } | { error: string }> {
  if (ownerType === "journey") {
    await requireOwnedJourney(ownerId);
  } else {
    await requireOwnedEpisode(ownerId);
  }

  if (!ALLOWED_VIDEO_TYPES.has(contentType)) {
    return { error: "Unsupported video format." };
  }

  const key = newVideoKey(contentType);
  const uploadUrl = await getVideoUploadUrl(key, contentType);
  return { uploadUrl, key };
}

// Copertina propria dell'Episodio, stesso meccanismo del video sopra: URL temporaneo per
// caricare l'immagine direttamente dal browser a R2.
export async function createEpisodePosterUploadUrl(
  ownerId: string,
  ownerType: "journey" | "episode",
  contentType: string
): Promise<{ uploadUrl: string; key: string } | { error: string }> {
  if (ownerType === "journey") {
    await requireOwnedJourney(ownerId);
  } else {
    await requireOwnedEpisode(ownerId);
  }

  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return { error: "Unsupported image format." };
  }

  const key = newImageKey("episode-covers", contentType);
  const uploadUrl = await getImageUploadUrl(key, contentType);
  return { uploadUrl, key };
}

// La dimensione dichiarata dal browser non è affidabile: il limite va verificato sul
// file effettivamente arrivato su R2, non sull'URL di upload (che non lo impone).
async function assertVideoWithinLimit(videoKey: string | undefined): Promise<string | null> {
  if (!videoKey) return null;
  const size = await getVideoSize(videoKey);
  if (size === null) return "Video upload not found. Please try uploading again.";
  if (size > MAX_VIDEO_SIZE_BYTES) {
    await deleteVideo(videoKey);
    return "Video is too large (max 1GB).";
  }
  return null;
}

// Logica di creazione condivisa tra `createEpisode` (form della Dashboard, termina con un
// redirect) e `quickCreateEpisode` (flusso rapido dal pulsante "+" globale, resta in un riquadro
// sopra la pagina corrente e quindi non può fare un redirect): stessa validazione dimensione video
// e stesso calcolo della posizione, un solo punto da aggiornare se la regola cambia.
async function insertEpisode(
  journey: Awaited<ReturnType<typeof requireOwnedJourney>>,
  chapterId: string | null,
  data: z.infer<typeof EpisodeSchema>,
  published: boolean
): Promise<{ error: string | null }> {
  // Un episodio non può diventare Published senza un video reale caricato (una caption da sola
  // non basta): niente pubblicazioni silenziose di contenuto vuoto.
  if (published && !data.videoKey) {
    return { error: "Add a video before publishing this episode." };
  }

  const sizeError = await assertVideoWithinLimit(data.videoKey || undefined);
  if (sizeError) return { error: sizeError };

  const lastEpisode = await prisma.episode.findFirst({
    where: { journeyId: journey.id, chapterId, deletedAt: null },
    orderBy: { order: "desc" },
  });

  const episode = await prisma.episode.create({
    data: {
      journeyId: journey.id,
      chapterId,
      title: data.title,
      caption: data.caption,
      videoKey: data.videoKey || undefined,
      posterKey: data.posterKey || undefined,
      durationSec: data.durationSec,
      occurredAt: data.occurredAt,
      order: (lastEpisode?.order ?? 0) + 1,
      publishedAt: published ? new Date() : null,
    },
  });

  // Notifica i follower solo se l'episodio è pubblicato E il Journey che lo contiene è già
  // pubblicato: gli episodi caricati mentre il Journey è ancora in Bozza diventano visibili tutti
  // insieme alla prima pubblicazione, già coperta da `notifyNewJourney` (vedi
  // lib/actions/journey.ts). Stessa regola già usata dal Feed dei creator seguiti in Home
  // (lib/discovery/feed.ts).
  if (published && LIVE_JOURNEY_STATUSES.includes(journey.status) && journey.publishedAt) {
    await notifyNewEpisode({
      creatorId: journey.creatorId,
      creatorName: journey.creator.displayName,
      journeyId: journey.id,
      journeyTitle: journey.title,
      episodeId: episode.id,
      episodeTitle: episode.title,
    });
  }

  revalidatePath(`/dashboard/journeys/${journey.id}`);
  revalidatePath(`/journeys/${journey.id}`);
  if (chapterId) revalidatePath(`/dashboard/journeys/${journey.id}/chapters/${chapterId}`);
  return { error: null };
}

export async function createEpisode(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const journeyId = formData.get("journeyId");
  if (typeof journeyId !== "string" || !journeyId) {
    return { error: "Invalid journey." };
  }
  const journey = await requireOwnedJourney(journeyId);
  const chapterId = await resolveChapterId(formData.get("chapterId"), journey.id);

  const parsed = EpisodeSchema.safeParse({
    title: formData.get("title"),
    caption: formData.get("caption") || undefined,
    videoKey: formData.get("videoKey") || undefined,
    posterKey: formData.get("posterKey") || undefined,
    durationSec: formData.get("durationSec") || undefined,
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  // Un episodio nasce in Bozza a meno che il creator non spunti esplicitamente "Published" nel
  // form: passaggio esplicito voluto, mai una pubblicazione automatica silenziosa.
  const published = formData.get("published") === "on";
  const result = await insertEpisode(journey, chapterId, parsed.data, published);
  if (result.error) return result;

  // Il creator viene riportato alla pagina del Journey (hub di gestione di Capitoli ed
  // Episodi), così ha un feedback visivo immediato che l'episodio è stato salvato.
  redirect(`/dashboard/journeys/${journey.id}`);
}

// Variante per il pulsante "+" globale (vedi components/creator/QuickUploadButton.tsx): stesso
// risultato di `createEpisode`, ma senza redirect, perché il flusso resta in un riquadro sopra la
// pagina in cui l'utente si trovava, non naviga verso la Dashboard.
export type QuickEpisodeState = { error: string | null; done: boolean };

export async function quickCreateEpisode(
  _prevState: QuickEpisodeState,
  formData: FormData
): Promise<QuickEpisodeState> {
  const journeyId = formData.get("journeyId");
  if (typeof journeyId !== "string" || !journeyId) {
    return { error: "Invalid journey.", done: false };
  }
  const journey = await requireOwnedJourney(journeyId);
  const chapterId = await resolveChapterId(formData.get("chapterId"), journey.id);

  const parsed = EpisodeSchema.safeParse({
    title: formData.get("title"),
    caption: formData.get("caption") || undefined,
    videoKey: formData.get("videoKey") || undefined,
    posterKey: formData.get("posterKey") || undefined,
    durationSec: formData.get("durationSec") || undefined,
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data.", done: false };
  }

  // Questo flusso rapido ("+" globale, primo episodio) è di per sé un'azione di pubblicazione
  // esplicita ("Publish Episode" / "Publish"): a differenza del form completo della Dashboard,
  // qui non c'è un interruttore Bozza/Pubblicato separato.
  const result = await insertEpisode(journey, chapterId, parsed.data, true);
  return { error: result.error, done: !result.error };
}

export async function updateEpisode(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const episodeId = formData.get("episodeId");
  if (typeof episodeId !== "string" || !episodeId) {
    return { error: "Invalid episode." };
  }
  const episode = await requireOwnedEpisode(episodeId);
  const chapterId = await resolveChapterId(formData.get("chapterId"), episode.journeyId);

  const parsed = EpisodeSchema.safeParse({
    title: formData.get("title"),
    caption: formData.get("caption") || undefined,
    videoKey: formData.get("videoKey") || undefined,
    posterKey: formData.get("posterKey") || undefined,
    durationSec: formData.get("durationSec") || undefined,
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const newVideoKeyValue = parsed.data.videoKey || null;
  const replacesVideo = newVideoKeyValue !== episode.videoKey;
  if (replacesVideo) {
    const sizeError = await assertVideoWithinLimit(newVideoKeyValue ?? undefined);
    if (sizeError) return { error: sizeError };
  }

  const newPosterKeyValue = parsed.data.posterKey || null;
  const replacesPoster = newPosterKeyValue !== null && newPosterKeyValue !== episode.posterKey;

  const published = formData.get("published") === "on";
  // Stessa regola di insertEpisode: niente Published senza un video reale.
  if (published && !newVideoKeyValue) {
    return { error: "Add a video before publishing this episode." };
  }

  await prisma.episode.update({
    where: { id: episode.id },
    data: {
      chapterId,
      title: parsed.data.title,
      caption: parsed.data.caption,
      videoKey: newVideoKeyValue,
      ...(replacesPoster ? { posterKey: newPosterKeyValue } : {}),
      durationSec: replacesVideo ? parsed.data.durationSec : (parsed.data.durationSec ?? episode.durationSec),
      occurredAt: parsed.data.occurredAt,
      publishedAt: published ? (episode.publishedAt ?? new Date()) : null,
    },
  });

  // Il vecchio file resta orfano su R2 se non viene ripulito qui: nessun'altra riga lo referenzia più.
  if (replacesVideo && episode.videoKey) {
    await deleteVideo(episode.videoKey);
  }
  if (replacesPoster && episode.posterKey) {
    await deleteImage(episode.posterKey);
  }

  revalidatePath(`/dashboard/journeys/${episode.journeyId}`);
  if (episode.chapterId) revalidatePath(`/dashboard/journeys/${episode.journeyId}/chapters/${episode.chapterId}`);
  if (chapterId) revalidatePath(`/dashboard/journeys/${episode.journeyId}/chapters/${chapterId}`);
  redirect(`/dashboard/journeys/${episode.journeyId}`);
}

export async function deleteEpisode(formData: FormData): Promise<void> {
  const episodeId = formData.get("episodeId");
  if (typeof episodeId !== "string" || !episodeId) notFound();
  const episode = await requireOwnedEpisode(episodeId);

  await prisma.episode.update({
    where: { id: episode.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/dashboard/journeys/${episode.journeyId}`);
  if (episode.chapterId) revalidatePath(`/dashboard/journeys/${episode.journeyId}/chapters/${episode.chapterId}`);
  redirect(`/dashboard/journeys/${episode.journeyId}`);
}

// Reorders by swapping `order` with the adjacent sibling. Simple by design: no
// batch reindexing, no drag & drop payload — just "move this one episode by one position".
// Siblings are scoped to the same group (same Journey, and same Chapter or same
// "no chapter" bucket): reordering never mixes episodes across different groups.
async function moveEpisode(episodeId: string, direction: "up" | "down") {
  const episode = await requireOwnedEpisode(episodeId);

  const siblings = await prisma.episode.findMany({
    where: { journeyId: episode.journeyId, chapterId: episode.chapterId, deletedAt: null },
    orderBy: { order: "asc" },
  });
  const index = siblings.findIndex((sibling) => sibling.id === episode.id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  const target = siblings[targetIndex];

  if (target) {
    await prisma.$transaction([
      prisma.episode.update({ where: { id: episode.id }, data: { order: target.order } }),
      prisma.episode.update({ where: { id: target.id }, data: { order: episode.order } }),
    ]);
  }

  return episode;
}

// Per il drag & drop: l'elemento può essere rilasciato più di una posizione più in
// là. Non introduce una nuova regola di riordino: ripete lo scambio con il vicino
// (la stessa funzione `moveEpisode` sopra) una volta per ogni posizione da percorrere.
export async function moveEpisodeToIndex(episodeId: string, targetIndex: number): Promise<void> {
  const episode = await requireOwnedEpisode(episodeId);

  const siblings = await prisma.episode.findMany({
    where: { journeyId: episode.journeyId, chapterId: episode.chapterId, deletedAt: null },
    orderBy: { order: "asc" },
  });
  const currentIndex = siblings.findIndex((sibling) => sibling.id === episodeId);
  if (currentIndex === -1) notFound();

  const clampedTarget = Math.max(0, Math.min(targetIndex, siblings.length - 1));
  const direction = clampedTarget > currentIndex ? "down" : "up";
  const steps = Math.abs(clampedTarget - currentIndex);

  for (let step = 0; step < steps; step++) {
    await moveEpisode(episodeId, direction);
  }

  revalidatePath(`/dashboard/journeys/${episode.journeyId}`);
  if (episode.chapterId) revalidatePath(`/dashboard/journeys/${episode.journeyId}/chapters/${episode.chapterId}`);
  // Il drag & drop ora vive anche nel Profilo (vedi components/profile/EpisodeReorderSection.tsx),
  // e l'ordine si riflette sulla Pagina Journey pubblica (elenco episodi incluso): va rivalidata.
  revalidatePath(`/journeys/${episode.journeyId}`);
}
