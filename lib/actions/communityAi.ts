"use server";

import { requireCreator } from "@/lib/creator";
import { firstNameOf } from "@/lib/format/firstName";
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

/** Un turno della chat "Crea con l'AI" nella pagina Community — solo il creator proprietario può
 * usarla (requireCreator), nessuna scrittura sul database: restituisce solo testo/bozza al client,
 * che li mostra dentro CommunityListingForm per la conferma manuale. */
export async function sendCommunityAiMessage(params: {
  message: string;
  previousInteractionId: string | null;
  history: CommunityChatMessage[];
  draftConversation: CommunityChatMessage[];
}): Promise<CommunityDraftTurnResult> {
  const { user } = await requireCreator();

  const trimmed = params.message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimmed) return { error: "Write a message first." };

  return continueCommunityDraftChat({
    message: trimmed,
    previousInteractionId: params.previousInteractionId,
    history: sanitizeHistory(params.history),
    draftConversation: sanitizeHistory(params.draftConversation),
    today: new Date(),
    creatorFirstName: firstNameOf(user.name),
  });
}
