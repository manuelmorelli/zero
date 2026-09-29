import { callGemini, parseGeminiJson, streamGemini, type GeminiInputPart } from "@/lib/ai/gemini";
import { getImageBytes } from "@/lib/r2";
import { PDF_CONTENT_TYPE, type CommunityAiAttachment } from "@/lib/constants/communityAiAttachment";
import { createCommunityImage, DAILY_AI_IMAGE_LIMIT, isAiImageGenerationEnabled } from "@/lib/ai/communityImage";
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
  location: string | null;
};

export type CommunityChatMessage = { role: "user" | "assistant"; text: string };

type RawDraft = Partial<Record<"type" | "title" | "description" | "startsAt" | "location", string>> & {
  isFree?: boolean;
  price?: number;
};

export type CommunityChatTurnResult =
  | { reply: string; imageKey: string | null; interactionId: string }
  | { error: string };

// La chat è una conversazione libera, come su Gemini (richiesta esplicita di Manuel il 2026-09-26:
// "impostala come una AI normale"). La bozza non esce più dalla risposta stessa ma da un secondo
// passaggio che legge la conversazione: così la risposta resta naturale e non vincolata a un
// formato rigido, che era la causa principale dell'effetto "robot".
function buildChatInstruction(today: Date, creatorFirstName: string | null, imagesEnabled: boolean): string {
  const todayLabel = today.toISOString().slice(0, 10);
  const nameLine = creatorFirstName
    ? `The creator you're talking to is called ${creatorFirstName}. Use their name occasionally and naturally, not in every reply.\n\n`
    : "";
  const imageLine = imagesEnabled
    ? `Images: you can create and edit images (covers, posters) for the creator. When the creator asks for one, Zero adds a note in square brackets to their message saying whether the image was actually created. Only say an image exists when that note says so; it is shown to the creator right above your reply, with a "Use as cover" button. If the note says it wasn't created, explain why honestly.`
    : `Images: creating images isn't active on Zero yet (coming soon). If asked, say so honestly and offer to write a detailed description of the image instead.`;
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

How the app works (describe nothing else): while you talk, Zero automatically prepares a draft from the conversation. A button labelled exactly "Fill the form with this" (always in English, never translate its name) appears under the chat once the kind and topic are clear; it opens the real form pre-filled, where the creator reviews, changes and saves it themselves. You never save, publish or send anything yourself, and you have no other buttons, panels or previews. The creator can attach photos and PDFs with the "+" button: when they do, you see them and can use them (describe a photo, summarize a PDF, turn it into a listing). Other file types aren't supported yet.

${imageLine}

Reply in the same language the creator writes in.`;
}

// La data di oggi serve anche qui: senza, "sabato 8 novembre" finiva in un anno passato.
function buildExtractionInstruction(today: Date): string {
  return `Today's date is ${today.toISOString().slice(0, 10)}.

You read a conversation between a creator and an AI assistant on Zero and extract the Community listing being prepared, as JSON. Kinds: "workshop", "event", "digital_product", "personal_service".

Rules:
- First decide "hasDraft": true as soon as the kind AND a topic are known, even if date, price, place and other details are still missing (a draft is meant to be incomplete, the creator finishes it in the form). Example: "an event" + "a trail run on Mont Blanc" is enough. false only if the kind or the topic is still unknown.
- When hasDraft is true, always include "draft".
- If several listings were discussed, extract the most recent one.
- title: short and specific, based on what the creator said or accepted. Never a placeholder like "New Event".
- description: the most complete description available (use the assistant's proposed description if the creator didn't reject it), otherwise write a short one from the facts given. Plain text, no Markdown.
- isFree: true only if the creator said it's free. price: only if the creator stated a price, never invent one.
- startsAt: only for workshop/event, ISO 8601 (YYYY-MM-DDTHH:mm if a time was given, else YYYY-MM-DD), always the next future occurrence after today.
- location: only for workshop/event, the venue address or online link if the creator mentioned one, otherwise omit.`;
}

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
        location: { type: "string" },
      },
      required: ["type", "title", "description"],
    },
  },
  required: ["hasDraft"],
  propertyOrdering: ["hasDraft", "draft"],
};

// Una data già passata non ha senso per un evento nuovo: capita quando il creator scrive un giorno
// della settimana che non torna ("sabato 8 novembre" è sabato nel 2025, non nel 2026) e il modello
// sceglie l'anno che combacia. La spostiamo all'anno dopo; il creator la ricontrolla nel modulo.
function futureStartsAt(raw: string | undefined, today: Date): string | null {
  if (!raw) return null;
  const match = raw.match(/^(\d{4})(-.*)$/);
  if (!match || Number.isNaN(new Date(raw).getTime())) return null;

  let year = Number(match[1]);
  while (new Date(`${year}${match[2]}`) < today) year++;
  return `${year}${match[2]}`;
}

function normalizeDraft(raw: RawDraft | undefined, today: Date): CommunityDraft | null {
  if (!raw?.type || !raw.title?.trim()) return null;
  if (!COMMUNITY_LISTING_TYPES.includes(raw.type as CommunityListingType)) return null;

  return {
    type: raw.type as CommunityListingType,
    title: raw.title.trim().slice(0, 100),
    description: (raw.description ?? "").trim().slice(0, 2000),
    isFree: Boolean(raw.isFree),
    price: typeof raw.price === "number" && raw.price > 0 ? raw.price : null,
    startsAt: futureStartsAt(raw.startsAt, today),
    location: raw.location?.trim() || null,
  };
}

function formatTranscript(messages: CommunityChatMessage[]): string {
  return messages
    .map((message) => `${message.role === "user" ? "Creator" : "Assistant"}: ${message.text}`)
    .join("\n\n");
}

async function extractDraft(conversation: CommunityChatMessage[], today: Date): Promise<CommunityDraft | null> {
  const result = await callGemini({
    input: formatTranscript(conversation),
    systemInstruction: buildExtractionInstruction(today),
    responseSchema: EXTRACTION_SCHEMA,
  });
  if ("error" in result) return null;
  return normalizeDraft(parseGeminiJson<{ draft?: RawDraft }>(result.text)?.draft, today);
}

const IMAGE_REQUEST_INSTRUCTION = `You read the end of a conversation between a creator and an AI assistant and decide whether the creator's LAST message asks to create or edit an image (cover, poster, picture, illustration). Return JSON.
- wantsImage: true only if the last message asks for an image now.
- editPreviousImage: true if they want to change the image created earlier in the conversation (e.g. "add the title", "make it brighter"), false for a brand new image.
- prompt: a detailed English prompt for an image model describing the whole result (subject, style, mood, any text to write in the image), using details from the conversation.`;

const IMAGE_REQUEST_SCHEMA = {
  type: "object",
  properties: {
    wantsImage: { type: "boolean" },
    editPreviousImage: { type: "boolean" },
    prompt: { type: "string" },
  },
  required: ["wantsImage"],
  propertyOrdering: ["wantsImage", "editPreviousImage", "prompt"],
};

const RECENT_CONTEXT_MESSAGES = 6;

async function detectImageRequest(
  history: CommunityChatMessage[],
  message: string
): Promise<{ prompt: string; editPreviousImage: boolean } | null> {
  const result = await callGemini({
    input: formatTranscript([...history.slice(-RECENT_CONTEXT_MESSAGES), { role: "user", text: message }]),
    systemInstruction: IMAGE_REQUEST_INSTRUCTION,
    responseSchema: IMAGE_REQUEST_SCHEMA,
  });
  if ("error" in result) return null;
  const parsed = parseGeminiJson<{ wantsImage?: boolean; editPreviousImage?: boolean; prompt?: string }>(result.text);
  if (!parsed?.wantsImage || !parsed.prompt?.trim()) return null;
  return { prompt: parsed.prompt.trim(), editPreviousImage: Boolean(parsed.editPreviousImage) };
}

// Nota aggiunta al messaggio del creator (solo verso Gemini, mai mostrata): così la risposta dice
// sempre la verità su un'immagine creata o no, stesso principio della bozza.
const IMAGE_NOTES = {
  created: "[Zero note: the image was created and is shown to the creator above your reply.]",
  limit: `[Zero note: the image was NOT created: the creator reached today's limit of ${DAILY_AI_IMAGE_LIMIT} images, they can create more tomorrow.]`,
  failed: "[Zero note: the image was NOT created because of a temporary problem; suggest trying again.]",
} as const;

// Gli allegati del "+" vanno a Gemini come file veri accanto al testo (gratis per foto e PDF).
// Un file sparito da R2 viene semplicemente saltato invece di far fallire tutto il messaggio.
async function buildAttachmentParts(attachments: CommunityAiAttachment[]): Promise<GeminiInputPart[]> {
  const parts: GeminiInputPart[] = [];
  for (const attachment of attachments) {
    // getImageBytes legge qualunque oggetto R2, anche i PDF.
    const file = await getImageBytes(attachment.key);
    if (!file) continue;
    const data = file.data.toString("base64");
    parts.push(
      attachment.kind === "pdf"
        ? { type: "document", data, mime_type: PDF_CONTENT_TYPE }
        : { type: "image", data, mime_type: file.contentType }
    );
  }
  return parts;
}

const ATTACHMENT_ONLY_MESSAGE = "(The creator sent the attached file without a message.)";

/**
 * Un turno della chat: la risposta arriva a pezzi tramite `onText` (come su Gemini), la bozza si
 * prepara dopo con extractCommunityDraft, mentre il creator legge. Gemini ricorda la conversazione
 * tramite `previousInteractionId`; se quella memoria non è più disponibile (scaduta: la chat resta
 * salvata fino al logout) si riparte rimandando la conversazione come testo, così l'AI non
 * "dimentica" mai quello che il creator vede.
 */
export async function continueCommunityChat(params: {
  userId: string;
  message: string;
  /** Ultima immagine AI della conversazione, già verificata come dell'utente: base per le modifiche. */
  lastImageKey: string | null;
  /** Allegati del "+" di questo messaggio, già verificati (proprietario, tipo, dimensione). */
  attachments: CommunityAiAttachment[];
  previousInteractionId: string | null;
  history: CommunityChatMessage[];
  today: Date;
  creatorFirstName: string | null;
  onText: (delta: string) => void;
}): Promise<CommunityChatTurnResult> {
  const imagesEnabled = isAiImageGenerationEnabled();
  const systemInstruction = buildChatInstruction(params.today, params.creatorFirstName, imagesEnabled);
  const message = params.message || ATTACHMENT_ONLY_MESSAGE;

  // Solo con le immagini attive: da spente non serve una chiamata in più, l'AI sa già che non può.
  let imageKey: string | null = null;
  let chatInput = message;
  const imageRequest = imagesEnabled ? await detectImageRequest(params.history, message) : null;
  if (imageRequest) {
    // Se il creator allega una foto e chiede di modificarla ("aggiungi il titolo a questa"), la
    // base è quella foto, non l'ultima immagine creata dall'AI.
    const attachedImageKey = params.attachments.find((attachment) => attachment.kind === "image")?.key;
    const image = await createCommunityImage({
      userId: params.userId,
      prompt: imageRequest.prompt,
      sourceKey: imageRequest.editPreviousImage ? (attachedImageKey ?? params.lastImageKey) : null,
    });
    if ("key" in image) imageKey = image.key;
    const note = "key" in image ? IMAGE_NOTES.created : image.unavailable === "limit" ? IMAGE_NOTES.limit : IMAGE_NOTES.failed;
    chatInput = `${message}\n\n${note}`;
  }

  const attachmentParts = await buildAttachmentParts(params.attachments);
  const withAttachments = (text: string): string | GeminiInputPart[] =>
    attachmentParts.length > 0 ? [{ type: "text", text }, ...attachmentParts] : text;

  // Il secondo tentativo ha senso solo se non è ancora arrivato nessun pezzo di testo, altrimenti
  // il creator vedrebbe la risposta ricominciare da capo.
  let streamedText = false;
  const onText = (delta: string) => {
    streamedText = true;
    params.onText(delta);
  };

  let chat = await streamGemini(
    { input: withAttachments(chatInput), systemInstruction, previousInteractionId: params.previousInteractionId ?? undefined },
    onText
  );
  if ("error" in chat && !streamedText && params.previousInteractionId && params.history.length > 0) {
    chat = await streamGemini(
      {
        input: withAttachments(
          `Conversation so far:\n\n${formatTranscript(params.history)}\n\nCreator's new message: ${chatInput}`
        ),
        systemInstruction,
      },
      onText
    );
  }
  if ("error" in chat) return chat;

  return { reply: chat.text, imageKey, interactionId: chat.interactionId };
}

/**
 * La bozza del turno appena concluso. `draftConversation` è la parte di conversazione dopo l'ultima
 * creazione confermata: la bozza viene estratta solo da lì, per non riproporre qualcosa che il
 * creator ha già creato.
 */
export async function extractCommunityDraft(params: {
  draftConversation: CommunityChatMessage[];
  message: string;
  reply: string;
  today: Date;
}): Promise<CommunityDraft | null> {
  return extractDraft(
    [
      ...params.draftConversation,
      { role: "user", text: params.message || ATTACHMENT_ONLY_MESSAGE },
      { role: "assistant", text: params.reply },
    ],
    params.today
  );
}
