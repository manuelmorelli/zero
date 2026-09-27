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

export type CommunityChatMessage = { role: "user" | "assistant"; text: string };

type RawDraft = Partial<Record<"type" | "title" | "description" | "startsAt", string>> & {
  isFree?: boolean;
  price?: number;
};

export type CommunityDraftTurnResult =
  | { reply: string; draft: CommunityDraft | null; interactionId: string }
  | { error: string };

// La chat è una conversazione libera, come su Gemini (richiesta esplicita di Manuel il 2026-09-26:
// "impostala come una AI normale"). La bozza non esce più dalla risposta stessa ma da un secondo
// passaggio che legge la conversazione: così la risposta resta naturale e non vincolata a un
// formato rigido, che era la causa principale dell'effetto "robot".
function buildChatInstruction(today: Date, creatorFirstName: string | null): string {
  const todayLabel = today.toISOString().slice(0, 10);
  const nameLine = creatorFirstName
    ? `The creator you're talking to is called ${creatorFirstName}. Use their name occasionally and naturally, not in every reply.\n\n`
    : "";
  return `You are the AI assistant on Zero, a platform where creators share their real journeys and build a community around them. You chat freely and naturally, like Gemini or ChatGPT would: answer any question, give ideas and honest advice (pricing, titles, audience, how to structure a session), and write good copy. Use Markdown (bold, bullet lists) when it helps readability.

${nameLine}Today's date is ${todayLabel}.

Your special skill here is helping the creator prepare something for their Community. Zero supports exactly four kinds:
- Workshop: a live or online session, free or paid, with a date and time.
- Event: an in-person or online event or meetup, free or paid, with a date and time.
- Digital product: a downloadable file (guide, template, ebook), always paid, no date.
- 1:1 service: consulting or coaching, always paid, no date.

When the creator wants to create one of these:
- Once you understand the kind and the topic, help complete it like a thoughtful collaborator: ask about the missing details one or two at a time (date and time, online or where, free or price, who it's for, what people will get or learn, duration).
- Write a complete, engaging description for them (not a single line) and improve it as you learn more.
- Suggest a price only if they ask for advice; never assume one.

How the app works (describe nothing else): while you talk, Zero automatically prepares a draft from the conversation. A "Fill the form with this" button appears under the chat once the kind and topic are clear; it opens the real form pre-filled, where the creator reviews, changes and saves it themselves. You never save, publish or send anything yourself, and you have no other buttons, panels or previews. Right now you can't create images or read files: if asked, say so honestly.

Reply in the same language the creator writes in.`;
}

const EXTRACTION_INSTRUCTION = `You read a conversation between a creator and an AI assistant on Zero and extract the Community listing being prepared, as JSON. Kinds: "workshop", "event", "digital_product", "personal_service".

Rules:
- First decide "hasDraft": true as soon as the kind AND a topic are known, even if date, price, place and other details are still missing (a draft is meant to be incomplete, the creator finishes it in the form). Example: "an event" + "a trail run on Mont Blanc" is enough. false only if the kind or the topic is still unknown.
- When hasDraft is true, always include "draft".
- If several listings were discussed, extract the most recent one.
- title: short and specific, based on what the creator said or accepted. Never a placeholder like "New Event".
- description: the most complete description available (use the assistant's proposed description if the creator didn't reject it), otherwise write a short one from the facts given. Plain text, no Markdown.
- isFree: true only if the creator said it's free. price: only if the creator stated a price, never invent one.
- startsAt: only for workshop/event, ISO 8601 (YYYY-MM-DDTHH:mm if a time was given, else YYYY-MM-DD), in the future.`;

// Se presente, la bozza deve avere tipo/titolo/descrizione: con i campi tutti facoltativi Gemini
// mandava bozze monche (senza titolo) che venivano scartate (verificato dal vivo il 2026-09-26).
// "hasDraft" obbligatorio e prima della bozza: senza una decisione esplicita il modello tendeva a
// non restituire nulla finché mancavano data o prezzo, e il pulsante compariva troppo tardi.
const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    hasDraft: { type: "boolean" },
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
  },
  required: ["hasDraft"],
  propertyOrdering: ["hasDraft", "draft"],
};

function normalizeDraft(raw: RawDraft | undefined): CommunityDraft | null {
  if (!raw?.type || !raw.title?.trim()) return null;
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

function formatTranscript(messages: CommunityChatMessage[]): string {
  return messages
    .map((message) => `${message.role === "user" ? "Creator" : "Assistant"}: ${message.text}`)
    .join("\n\n");
}

async function extractDraft(conversation: CommunityChatMessage[]): Promise<CommunityDraft | null> {
  const result = await callGemini({
    input: formatTranscript(conversation),
    systemInstruction: EXTRACTION_INSTRUCTION,
    responseSchema: EXTRACTION_SCHEMA,
  });
  if ("error" in result) return null;
  return normalizeDraft(parseGeminiJson<{ draft?: RawDraft }>(result.text)?.draft);
}

/**
 * Un turno della chat. Gemini ricorda la conversazione tramite `previousInteractionId`; se quella
 * memoria non è più disponibile (scaduta: la chat ora resta salvata fino al logout) si riparte
 * rimandando la conversazione come testo, così l'AI non "dimentica" mai quello che il creator vede.
 * `draftConversation` è la parte di conversazione dopo l'ultima creazione confermata: la bozza viene
 * estratta solo da lì, per non riproporre qualcosa che il creator ha già creato.
 */
export async function continueCommunityDraftChat(params: {
  message: string;
  previousInteractionId: string | null;
  history: CommunityChatMessage[];
  draftConversation: CommunityChatMessage[];
  today: Date;
  creatorFirstName: string | null;
}): Promise<CommunityDraftTurnResult> {
  const systemInstruction = buildChatInstruction(params.today, params.creatorFirstName);

  let chat = await callGemini({
    input: params.message,
    systemInstruction,
    previousInteractionId: params.previousInteractionId ?? undefined,
  });
  if ("error" in chat && params.previousInteractionId && params.history.length > 0) {
    chat = await callGemini({
      input: `Conversation so far:\n\n${formatTranscript(params.history)}\n\nCreator's new message: ${params.message}`,
      systemInstruction,
    });
  }
  if ("error" in chat) return chat;

  const draft = await extractDraft([
    ...params.draftConversation,
    { role: "user", text: params.message },
    { role: "assistant", text: chat.text },
  ]);

  return { reply: chat.text, draft, interactionId: chat.interactionId };
}
