import { isOwnAiImageKey } from "@/lib/ai/communityImage";
import { getVideoSize } from "@/lib/r2";
import {
  maxAttachmentSize,
  MAX_AI_ATTACHMENTS_PER_MESSAGE,
  type CommunityAiAttachment,
} from "@/lib/constants/communityAiAttachment";
import type { CommunityChatMessage } from "@/lib/ai/communityDraft";

const MAX_MESSAGE_LENGTH = 2000;
// La conversazione arriva dal browser (resta salvata lì fino al logout): la accorciamo sempre qui,
// così un client manomesso non può mandare a Gemini testi enormi.
const MAX_HISTORY_MESSAGES = 40;
const MAX_HISTORY_MESSAGE_LENGTH = 4000;

export type CommunityChatRequest = {
  message: string;
  previousInteractionId: string | null;
  history: CommunityChatMessage[];
  draftConversation: CommunityChatMessage[];
  lastImageKey: string | null;
  attachments: CommunityAiAttachment[];
};

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

/** Controlla e ripulisce una richiesta della chat AI Community arrivata dal browser. */
export async function parseCommunityChatRequest(
  userId: string,
  raw: Record<string, unknown>
): Promise<CommunityChatRequest | { error: string }> {
  const attachments = await verifyAttachments(userId, raw.attachments);
  if ("error" in attachments) return attachments;

  const message = typeof raw.message === "string" ? raw.message.trim().slice(0, MAX_MESSAGE_LENGTH) : "";
  if (!message && attachments.length === 0) return { error: "Write a message first." };

  return {
    message,
    previousInteractionId: typeof raw.previousInteractionId === "string" ? raw.previousInteractionId : null,
    history: sanitizeHistory(raw.history),
    draftConversation: sanitizeHistory(raw.draftConversation),
    lastImageKey:
      typeof raw.lastImageKey === "string" && isOwnAiImageKey(userId, raw.lastImageKey) ? raw.lastImageKey : null,
    attachments,
  };
}
