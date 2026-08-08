"use server";

import { requireSession } from "@/lib/session";
import { newImageKey, getImageUploadUrl } from "@/lib/r2";
import { ALLOWED_IMAGE_TYPES } from "@/lib/constants/image";

type ProfileImageKind = "avatar" | "cover";

/** Genera un URL di upload diretto verso R2 per la foto profilo o di copertina dell'utente loggato. */
export async function createProfileImageUploadUrl(
  kind: ProfileImageKind,
  contentType: string
): Promise<{ uploadUrl: string; key: string } | { error: string }> {
  await requireSession();

  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return { error: "Unsupported image format." };
  }

  const key = newImageKey(kind === "avatar" ? "avatars" : "covers", contentType);
  const uploadUrl = await getImageUploadUrl(key, contentType);
  return { uploadUrl, key };
}
