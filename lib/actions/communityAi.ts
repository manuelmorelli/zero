"use server";

import { requireCreator } from "@/lib/creator";
import { continueCommunityDraftChat, type CommunityDraftTurnResult } from "@/lib/ai/communityDraft";

const MAX_MESSAGE_LENGTH = 500;

/** Un turno della chat "Crea con l'AI" nella pagina Community — solo il creator proprietario può
 * usarla (requireCreator), nessuna scrittura sul database: restituisce solo testo/bozza al client,
 * che li mostra dentro CommunityListingForm per la conferma manuale. */
export async function sendCommunityAiMessage(
  message: string,
  previousInteractionId: string | null
): Promise<CommunityDraftTurnResult> {
  await requireCreator();

  const trimmed = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimmed) return { error: "Write a message first." };

  return continueCommunityDraftChat({ message: trimmed, previousInteractionId, today: new Date() });
}
