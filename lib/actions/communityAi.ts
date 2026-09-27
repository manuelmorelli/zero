"use server";

import { requireCreator } from "@/lib/creator";
import { firstNameOf } from "@/lib/format/firstName";
import { isOwnAiImageKey, newAiUploadKey } from "@/lib/ai/communityImage";
import { getFileUploadUrl, getVideoSize } from "@/lib/r2";
import {
  attachmentKindOf,
  maxAttachmentSize,
  MAX_AI_ATTACHMENTS_PER_MESSAGE,
  type CommunityAiAttachment,
} from "@/lib/constants/communityAiAttachment";
import {
  continueCommunityDraftChat,
  type CommunityChatMessage,
  type CommunityDraftTurnResult,
} from "@/lib/ai/communityDraft";

const MAX_MESSAGE_LENGTH = 2000;
// La conversazione arriva dal browser (resta salvata lì fino al logout): la accorciamo sempre qui,
// così un client manomesso non può mandare a Gemini testi enormi.
const MAX_HISTORY_MESSAGES = 40;
const MAX_HISTORY_MESSAGE_LENGTH = 4000;

function sanitizeHistory(raw: unknown): CommunityChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is CommunityChatMessage =>
        (item?.role === "user" || item?.role === "assistant") && typeof item?.text === "string"
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({ role: item.role, text: item.text.slice(0, MAX_HISTORY_MESSAGE_LENGTH) }));
}

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

// Allegati arrivati dal browser: solo chiavi dell'utente, del tipo dichiarato e dentro i limiti di
// dimensione (controllati sul file vero su R2, non su quanto dice il browser).
async function verifyAttachments(userId: string, raw: unknown): Promise<CommunityAiAttachment[] | { error: string }> {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  if (raw.length > MAX_AI_ATTACHMENTS_PER_MESSAGE) {
    return { error: `You can attach up to ${MAX_AI_ATTACHMENTS_PER_MESSAGE} files per message.` };
  }

  const verified: CommunityAiAttachment[] = [];
  for (const item of raw) {
    const key = typeof item?.key === "string" ? item.key : "";
    const kind = item?.kind === "image" || item?.kind === "pdf" ? item.kind : null;
    if (!kind || !isOwnAiImageKey(userId, key) || key.endsWith(".pdf") !== (kind === "pdf")) {
      return { error: "Invalid attachment." };
    }
    // getVideoSize è un controllo generico della dimensione di un oggetto su R2, non solo video.
    const size = await getVideoSize(key);
    if (size === null || size > maxAttachmentSize(kind)) return { error: "Attachment missing or too large." };
    verified.push({ key, kind, name: typeof item?.name === "string" ? item.name.slice(0, 120) : "" });
  }
  return verified;
}

/** Un turno della chat "Crea con l'AI" nella pagina Community — solo il creator proprietario può
 * usarla (requireCreator). Non salva mai la bozza: restituisce solo testo/bozza al client, che li
 * mostra dentro CommunityListingForm per la conferma manuale. L'unica scrittura è il conteggio
 * delle immagini AI create (limite giornaliero, lib/ai/communityImage.ts). */
export async function sendCommunityAiMessage(params: {
  message: string;
  previousInteractionId: string | null;
  history: CommunityChatMessage[];
  draftConversation: CommunityChatMessage[];
  lastImageKey: string | null;
  attachments: CommunityAiAttachment[];
}): Promise<CommunityDraftTurnResult> {
  const { user } = await requireCreator();

  const attachments = await verifyAttachments(user.id, params.attachments);
  if ("error" in attachments) return attachments;

  const trimmed = params.message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimmed && attachments.length === 0) return { error: "Write a message first." };

  const lastImageKey =
    typeof params.lastImageKey === "string" && isOwnAiImageKey(user.id, params.lastImageKey)
      ? params.lastImageKey
      : null;

  return continueCommunityDraftChat({
    userId: user.id,
    message: trimmed,
    lastImageKey,
    attachments,
    previousInteractionId: params.previousInteractionId,
    history: sanitizeHistory(params.history),
    draftConversation: sanitizeHistory(params.draftConversation),
    today: new Date(),
    creatorFirstName: firstNameOf(user.name),
  });
}
