import { callGemini, parseGeminiJson, type GeminiInputPart } from "@/lib/ai/gemini";

type ModerationResult = { flagged: boolean; categories: string[] };

export const MODERATION_REJECTION_MESSAGE =
  "This content doesn't meet our community guidelines. Please review and try again.";

/**
 * Primo filtro automatico su testo e immagini appena caricati. Passato da OpenAI a Gemini il
 * 2026-09-25 (Punto 8 dell'allineamento): stessa funzione, stesso comportamento "fail open" (un
 * problema del servizio non deve impedire di pubblicare contenuto legittimo), ma senza il blocco
 * della carta di credito che teneva OpenAI spenta — GEMINI_API_KEY è già configurata e gratuita,
 * quindi la moderazione si attiva per la prima volta su tutta la piattaforma da questa modifica.
 *
 * Copre solo testo e immagini, mai i video (decisione di Manuel, 2026-09-25: "troppa roba" — non
 * riproporre l'idea).
 */
const MODERATION_SYSTEM_INSTRUCTION = `You are the automated content moderation filter for Zero, a platform where creators share real personal life journeys (health, recovery, habits, relationships, and similar topics).

Flag content ONLY if it clearly falls into one of these categories:
- sexual content involving minors
- sexual or pornographic content
- incitement to violence, or graphic/gratuitous violence
- hate speech targeting a protected group
- promotion or glorification of self-harm or suicide
- harassment or bullying targeting a real, identifiable person

Do NOT flag: ordinary personal storytelling, difficult topics discussed respectfully (illness, grief, addiction recovery, mental health), strong opinions, or content that merely mentions a sensitive topic without promoting it.

Reply only with the requested JSON, nothing else.`;

const MODERATION_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    flagged: { type: "boolean" },
    categories: { type: "array", items: { type: "string" } },
  },
  required: ["flagged", "categories"],
};

async function moderate(input: GeminiInputPart[]): Promise<ModerationResult> {
  const result = await callGemini({
    input,
    systemInstruction: MODERATION_SYSTEM_INSTRUCTION,
    responseSchema: MODERATION_RESPONSE_SCHEMA,
  });
  if ("error" in result) return { flagged: false, categories: [] };

  const parsed = parseGeminiJson<ModerationResult>(result.text);
  if (!parsed) return { flagged: false, categories: [] };
  return { flagged: Boolean(parsed.flagged), categories: parsed.categories ?? [] };
}

export async function moderateText(text: string | undefined | null): Promise<ModerationResult> {
  if (!text || !text.trim()) return { flagged: false, categories: [] };
  return moderate([{ type: "text", text }]);
}

export async function moderateImageUrl(imageUrl: string): Promise<ModerationResult> {
  let response: Response;
  try {
    response = await fetch(imageUrl);
  } catch (error) {
    console.error("[moderation] failed to fetch image", error);
    return { flagged: false, categories: [] };
  }
  if (!response.ok) {
    console.error(`[moderation] failed to fetch image: ${response.status}`);
    return { flagged: false, categories: [] };
  }

  const mimeType = response.headers.get("content-type") ?? "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  return moderate([
    { type: "text", text: "Moderate this image against the community guidelines." },
    { type: "image", data: buffer.toString("base64"), mime_type: mimeType },
  ]);
}
