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
  draft?: RawDraft;
  replyMentionsDraft?: boolean;
};

export type CommunityDraftTurnResult =
  | { reply: string; draft: CommunityDraft | null; interactionId: string }
  | { error: string };

// "draft" viene prima di "reply" e, se presente, ha tipo/titolo/descrizione obbligatori: con i campi
// tutti facoltativi Gemini mandava spesso una bozza monca (senza titolo) che veniva scartata, mentre
// la risposta diceva "ho preparato la bozza" (verificato dal vivo il 2026-09-26).
const DRAFT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
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
      required: ["type", "title", "description"],
    },
    reply: { type: "string" },
    // Autodichiarazione scritta DOPO il testo: permette di accorgersi, in qualunque lingua, di una
    // risposta che parla di bozza/pulsante senza allegare la bozza (vedi continueCommunityDraftChat).
    replyMentionsDraft: { type: "boolean" },
  },
  required: ["reply", "replyMentionsDraft"],
  propertyOrdering: ["draft", "reply", "replyMentionsDraft"],
};

function buildSystemInstruction(today: Date, creatorFirstName: string | null): string {
  const todayLabel = today.toISOString().slice(0, 10);
  const nameLine = creatorFirstName
    ? `The creator you're talking to is called ${creatorFirstName}. You may use their name occasionally and naturally, never in every reply.

`
    : "";
  return `You are the Community assistant on Zero, a platform for creators. You help a creator turn a short natural-language request into a draft listing, which they will review and confirm themselves before anything is saved — you never save or publish anything yourself.

${nameLine}Today's date is ${todayLabel}. Resolve relative dates ("next Tuesday", "23 February") into a real ISO date (YYYY-MM-DD) in the future using this.

There are exactly four kinds of listing the creator can create — never invent a new kind:
- "workshop": a live or online workshop session, can be free or paid, has a date (startsAt).
- "event": an in-person or online event/meetup, can be free or paid, has a date (startsAt).
- "digital_product": a downloadable file (guide, template, ebook) the creator uploads separately, always paid, no date.
- "personal_service": a 1:1 consulting/coaching offer, always paid, no date.

What the creator actually sees (describe nothing else):
- A simple chat with your replies.
- Whenever your response includes a "draft" object, a single button appears under the chat: "Fill the form with this". Clicking it opens the real form pre-filled with your draft, where the creator reviews, edits and saves it themselves.
- There is no side panel, no preview, no attachment, no link and no other UI. Never mention anything that is not in this list.

Rules:
- Reply in the same language the creator writes in.
- Keep replies short and conversational (1-3 sentences), like a helpful assistant, never robotic or formal.
- Ask a clarifying question only when something essential is truly missing (which of the 4 kinds, and a title/topic). Don't over-ask: once the kind and topic are clear, produce the draft even if minor details are still missing.
- NEVER invent a price. If the creator didn't mention one, omit price entirely (they'll set it themselves in the form). Only set isFree to true if the creator explicitly said it's free.
- As soon as you know the kind and a title, include the COMPLETE "draft" object in your response, and keep including the complete, up-to-date draft in EVERY following response of the conversation (including every change the creator asked for), even when the creator is only chatting or saying thanks.
- Your reply text must match your response exactly: only say a draft is ready (and point to the "Fill the form with this" button) when this same response includes the "draft" object. Never claim to have prepared, attached or updated something you are not including.
- The title must come from the topic the creator actually gave you, even a generic one (e.g. "a guide" → "Guide", "a guide about nutrition" → "Nutrition Guide"). Never use placeholder titles or descriptions like "New Event" or "Event description goes here": if there is no topic at all yet, omit the draft and ask for it.
- Set replyMentionsDraft to true if your reply text talks about a draft, a form or the button in any language, false otherwise.
- Never put JSON or code in the reply text: the draft goes only in the "draft" field.
- If the request is still too vague to pick one of the 4 kinds or a topic, omit draft and ask ONE short question about what's missing. In a response without a draft, never mention a draft, a form or a button.`;
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

// Il modello "lite" a volte scrive la bozza come blocco JSON dentro il testo invece che nel campo
// "draft": la recuperiamo da lì e la togliamo dal messaggio mostrato al creator.
const JSON_BLOCK_PATTERN = /```(?:json)?s*([sS]*?)```/;

function extractDraftFromReply(reply: string): { reply: string; draft: RawDraft | undefined } {
  const match = reply.match(JSON_BLOCK_PATTERN);
  if (!match) return { reply, draft: undefined };

  let embedded: { draft?: RawDraft } & RawDraft;
  try {
    embedded = JSON.parse(match[1]);
  } catch {
    embedded = {};
  }
  return { reply: reply.replace(match[0], "").trim(), draft: embedded.draft ?? embedded };
}

// Un secondo tentativo basta quasi sempre a correggere una risposta incoerente (verificato dal vivo
// il 2026-09-26); oltre, meglio una risposta onesta di ripiego che far aspettare il creator.
const MAX_ATTEMPTS = 2;
const FALLBACK_REPLY = "Could you tell me a bit more, like what kind of listing it is and its topic? Then I'll prepare the draft.";

/** Un turno della chat: il chiamante mantiene solo `interactionId` tra un turno e l'altro (nessuno
 * storico da salvare lato Zero, lo gestisce Gemini). Vedi lib/actions/communityAi.ts per l'azione
 * server che espone questa funzione al componente client. */
export async function continueCommunityDraftChat(params: {
  message: string;
  previousInteractionId: string | null;
  today: Date;
  creatorFirstName: string | null;
}): Promise<CommunityDraftTurnResult> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await callGemini({
      input: params.message,
      systemInstruction: buildSystemInstruction(params.today, params.creatorFirstName),
      previousInteractionId: params.previousInteractionId ?? undefined,
      responseSchema: DRAFT_RESPONSE_SCHEMA,
    });
    if ("error" in result) return result;

    const parsed = parseGeminiJson<DraftReplyPayload>(result.text);
    if (!parsed) return { error: "The AI assistant didn't return a usable answer." };

    const embedded = extractDraftFromReply(parsed.reply);
    // Il pulsante dipende solo dalla presenza di una bozza valida, mai da un segnale separato del
    // modello: in passato l'AI mandava la bozza ma dimenticava il flag, e il pulsante non compariva.
    const draft = normalizeDraft(parsed.draft) ?? normalizeDraft(embedded.draft);
    const claimsMissingDraft = !draft && Boolean(parsed.replyMentionsDraft);

    if (!claimsMissingDraft) {
      return { reply: embedded.reply, draft, interactionId: result.interactionId };
    }
    if (attempt === MAX_ATTEMPTS) {
      return { reply: FALLBACK_REPLY, draft: null, interactionId: result.interactionId };
    }
  }
  return { error: "The AI assistant didn't return a usable answer." };
}
