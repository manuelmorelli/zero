"use server";

import { requireCreator } from "@/lib/creator";
import { newAiUploadKey } from "@/lib/ai/communityImage";
import { getFileUploadUrl } from "@/lib/r2";
import { attachmentKindOf } from "@/lib/constants/communityAiAttachment";

// La conversazione vera e propria passa da app/api/community-ai/chat/route.ts, che manda la
// risposta a pezzi mentre l'AI la scrive (un'azione server la restituirebbe solo tutta alla fine).

/** URL temporaneo per caricare un allegato del "+" (foto o PDF) direttamente dal browser a R2,
 * stesso schema delle copertine. La dimensione vera si verifica all'invio del messaggio. */
export async function createCommunityAiAttachmentUploadUrl(
  contentType: string
): Promise<{ uploadUrl: string; key: string } | { error: string }> {
  const { user } = await requireCreator();
  if (!attachmentKindOf(contentType)) return { error: "Only photos (JPG, PNG, WebP) and PDFs." };

  const key = newAiUploadKey(user.id, contentType);
  return { uploadUrl: await getFileUploadUrl(key, contentType), key };
}
