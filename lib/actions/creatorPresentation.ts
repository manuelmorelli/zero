"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { deleteVideo, getVideoSize, getVideoUploadUrl, newVideoKey } from "@/lib/r2";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from "@/lib/constants/video";

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
