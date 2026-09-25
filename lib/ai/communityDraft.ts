import { callGemini, parseGeminiJson } from "@/lib/ai/gemini";
import { COMMUNITY_LISTING_TYPES, type CommunityListingType } from "@/lib/constants/communityListing";

/**
 * Bozza proposta dalla chat AI (Punto 8 dell'allineamento): mai salvata direttamente, viene solo
 * usata per pre-compilare CommunityListingForm — il creator la rivede e conferma lui col pulsante
 * "Crea", esattamente come se l'avesse scritta a mano.
 */
export type CommunityDraft = {
  type: CommunityListingType;
  title: string;
  description: string;
  isFree: boolean;
  price: number | null;
  startsAt: string | null;
};

type RawDraft = Partial<Record<"type" | "title" | "description" | "startsAt", string>> & {
  isFree?: boolean;
  price?: number;
};

type DraftReplyPayload = {
  reply: string;
  readyToFill: boolean;
  draft?: RawDraft;
};

export type CommunityDraftTurnResult =
  | { reply: string; readyToFill: boolean; draft: CommunityDraft | null; interactionId: string }
  | { error: string };

const DRAFT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    readyToFill: { type: "boolean" },
    draft: {
      type: "object",
      properties: {
        type: { type: "string", enum: [...COMMUNITY_LISTING_TYPES] },
        title: { type: "string" },
        description: { type: "string" },
        isFree: { type: "boolean" },
        price: { type: "number" },
        startsAt: { type: "string" },
      },
    },
  },
  required: ["reply", "readyToFill"],
};

function buildSystemInstruction(today: Date): string {
  const todayLabel = today.toISOString().slice(0, 10);
  return `You are the Community assistant on Zero, a platform for creators. You help a creator turn a short natural-language request into a draft listing, which they will review and confirm themselves before anything is saved — you never save or publish anything yourself.

Today's date is ${todayLabel}. Resolve relative dates ("next Tuesday", "23 February") into a real ISO date (YYYY-MM-DD) in the future using this.

There are exactly four kinds of listing the creator can create — never invent a new kind:
- "workshop": a live or online workshop session, can be free or paid, has a date (startsAt).
- "event": an in-person or online event/meetup, can be free or paid, has a date (startsAt).
- "digital_product": a downloadable file (guide, template, ebook) the creator uploads separately, always paid, no date.
- "personal_service": a 1:1 consulting/coaching offer, always paid, no date.

Rules:
- Reply in the same language the creator writes in.
- Keep replies short and conversational (1-3 sentences), like a helpful assistant, never robotic or formal.
- Ask a clarifying question only when something essential is truly missing (which of the 4 kinds, and a title/topic). Don't over-ask: once the kind and topic are clear, set readyToFill to true even if minor details are still missing.
- NEVER invent a price. If the creator didn't mention one, omit price entirely (they'll set it themselves in the form). Only set isFree to true if the creator explicitly said it's free.
- Once you have at least a type and a title, include a "draft" object and set readyToFill to true.
- If the request is still too vague to pick one of the 4 kinds, omit draft and set readyToFill to false, and ask what they'd like to create.`;
}

function normalizeDraft(raw: RawDraft | undefined): CommunityDraft | null {
  if (!raw?.type || !raw.title) return null;
  if (!COMMUNITY_LISTING_TYPES.includes(raw.type as CommunityListingType)) return null;

  return {
    type: raw.type as CommunityListingType,
    title: raw.title.trim().slice(0, 100),
    description: (raw.description ?? "").trim().slice(0, 2000),
    isFree: Boolean(raw.isFree),
    price: typeof raw.price === "number" && raw.price > 0 ? raw.price : null,
    startsAt: raw.startsAt ?? null,
  };
}

/** Un turno della chat: il chiamante mantiene solo `interactionId` tra un turno e l'altro (nessuno
 * storico da salvare lato Zero, lo gestisce Gemini). Vedi lib/actions/communityAi.ts per l'azione
 * server che espone questa funzione al componente client. */
export async function continueCommunityDraftChat(params: {
  message: string;
  previousInteractionId: string | null;
  today: Date;
}): Promise<CommunityDraftTurnResult> {
  const result = await callGemini({
    input: params.message,
    systemInstruction: buildSystemInstruction(params.today),
    previousInteractionId: params.previousInteractionId ?? undefined,
    responseSchema: DRAFT_RESPONSE_SCHEMA,
  });
  if ("error" in result) return result;

  const parsed = parseGeminiJson<DraftReplyPayload>(result.text);
  if (!parsed) return { error: "The AI assistant didn't return a usable answer." };

  const draft = normalizeDraft(parsed.draft);
  return {
    reply: parsed.reply,
    readyToFill: Boolean(parsed.readyToFill) && draft !== null,
    draft,
    interactionId: result.interactionId,
  };
}
