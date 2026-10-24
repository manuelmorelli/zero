"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { deleteImage, deleteVideo, getImagePlaybackUrl, getImageUploadUrl, getVideoSize, getVideoUploadUrl, newImageKey, newVideoKey } from "@/lib/r2";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from "@/lib/constants/video";
import { ALLOWED_IMAGE_TYPES } from "@/lib/constants/image";
import { moderateImageUrl, MODERATION_REJECTION_MESSAGE } from "@/lib/moderation";

/** Genera l'URL di upload diretto verso R2 per il video di presentazione del creator loggato —
 * stesso meccanismo del video degli episodi (vedi createEpisodeVideoUploadUrl in
 * lib/actions/episode.ts), solo con un prefisso di chiave dedicato. */
export async function createPresentationVideoUploadUrl(
  contentType: string
): Promise<{ uploadUrl: string; key: string } | { error: string }> {
  await requireCreator();

  if (!ALLOWED_VIDEO_TYPES.has(contentType)) {
    return { error: "Unsupported video format." };
  }

  const key = newVideoKey(contentType, "creator-presentations");
  const uploadUrl = await getVideoUploadUrl(key, contentType);
  return { uploadUrl, key };
}

/** Attiva il Trust Score del creator (lib/profile/trustScore.ts) valorizzando per la prima volta
 * `Creator.presentationVideoUrl` — finché è vuoto, il punteggio resta nascosto per chiunque. */
export async function updatePresentationVideo(key: string): Promise<{ error: string | null }> {
  const { creator } = await requireCreator();
  if (!key) return { error: "Missing video." };

  // La dimensione dichiarata dal browser non è affidabile: si verifica il file effettivamente
  // arrivato su R2, stesso principio già in uso per gli episodi.
  const size = await getVideoSize(key);
  if (size === null) return { error: "Video upload not found. Please try uploading again." };
  if (size > MAX_VIDEO_SIZE_BYTES) {
    await deleteVideo(key);
    return { error: "Video is too large (max 1GB)." };
  }

  const previousKey = creator.presentationVideoUrl;
  await prisma.creator.update({
    where: { id: creator.id },
    data: { presentationVideoUrl: key },
  });
  // Il vecchio file resta orfano su R2 se non viene ripulito qui: nessun'altra riga lo referenzia più.
  if (previousKey && previousKey !== key) {
    await deleteVideo(previousKey);
  }

  revalidatePath(`/profile/${creator.userId}`);
  return { error: null };
}

/** Genera l'URL di upload diretto verso R2 per la copertina del video di presentazione —
 * stesso meccanismo di createProfileImageUploadUrl (lib/actions/profileMedia.ts), solo con un
 * prefisso di chiave dedicato. */
export async function createPresentationCoverUploadUrl(
  contentType: string
): Promise<{ uploadUrl: string; key: string } | { error: string }> {
  await requireCreator();

  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return { error: "Unsupported image format." };
  }

  const key = newImageKey("presentation-covers", contentType);
  const uploadUrl = await getImageUploadUrl(key, contentType);
  return { uploadUrl, key };
}

/** Salva la copertina del video di presentazione. Indipendente da updatePresentationVideo:
 * si può cambiare la copertina senza toccare il video, e viceversa. */
export async function updatePresentationCover(key: string): Promise<{ error: string | null }> {
  const { creator } = await requireCreator();
  if (!key) return { error: "Missing image." };

  // Stesso filtro automatico (lib/moderation.ts, Gemini) già usato per le altre foto profilo in
  // updateAccount (lib/actions/account.ts): fail-open se il servizio non risponde.
  const playbackUrl = await getImagePlaybackUrl(key);
  const moderation = await moderateImageUrl(playbackUrl);
  if (moderation.flagged) {
    await deleteImage(key);
    return { error: MODERATION_REJECTION_MESSAGE };
  }

  const previousKey = creator.presentationCoverUrl;
  await prisma.creator.update({
    where: { id: creator.id },
    data: { presentationCoverUrl: key },
  });
  if (previousKey && previousKey !== key) {
    await deleteImage(previousKey);
  }

  revalidatePath(`/profile/${creator.userId}`);
  return { error: null };
}
