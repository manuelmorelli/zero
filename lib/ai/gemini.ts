// Client generico per l'Interactions API di Gemini (endpoint verificato dal vivo il 2026-09-25,
// sostituisce la vecchia API generateContent/contents che compare nei training set più datati —
// stesso tipo di avviso di AGENTS.md per Next.js, valido anche per servizi esterni che cambiano
// nel tempo). Nessuna libreria ufficiale: solo fetch, stesso principio già in uso per OpenAI in
// lib/moderation.ts prima di questa modifica.
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";

// Modello "flash-lite": quota gratuita più ampia (Google AI Studio, piano gratuito) rispetto al
// modello "flash" pieno — scelta deliberata per restare dentro al piano gratuito con margine,
// vedi Punto 8 dell'allineamento ("nessuna attivazione di servizi a pagamento").
const GEMINI_MODEL = "gemini-3.5-flash-lite";

export type GeminiInputPart =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mime_type: string }
  | { type: "document"; data: string; mime_type: string };

type GeminiCallParams = {
  input: string | GeminiInputPart[];
  systemInstruction?: string;
  previousInteractionId?: string;
  responseSchema?: object;
};

type GeminiCallResult = { text: string; interactionId: string } | { error: string };

const UNAVAILABLE = "The AI assistant is unavailable right now.";
const UNUSABLE = "The AI assistant didn't return a usable answer.";

/** Invia una richiesta all'Interactions API. Torna la risposta HTTP solo se è andata a buon fine. */
async function postInteraction(params: GeminiCallParams, stream: boolean): Promise<Response | { error: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: "AI assistant is not configured." };

  const body: Record<string, unknown> = {
    model: GEMINI_MODEL,
    input: params.input,
  };
  if (params.systemInstruction) body.system_instruction = params.systemInstruction;
  if (params.previousInteractionId) body.previous_interaction_id = params.previousInteractionId;
  if (params.responseSchema) {
    body.response_format = { type: "text", mime_type: "application/json", schema: params.responseSchema };
  }
  if (stream) body.stream = true;

  let response: Response;
  try {
    response = await fetch(stream ? `${GEMINI_ENDPOINT}?alt=sse` : GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("[gemini] request failed", error);
    return { error: UNAVAILABLE };
  }

  if (!response.ok) {
    console.error(`[gemini] request failed: ${response.status} ${await response.text().catch(() => "")}`);
    return { error: UNAVAILABLE };
  }
  return response;
}

/**
 * Chiamata di basso livello, condivisa da moderazione (lib/moderation.ts) e dall'assistente di
 * creazione Community (lib/ai/communityDraft.ts). Non lancia mai un'eccezione: un problema di rete
 * o della chiave mancante torna come `{ error }`, mai un crash della pagina che la chiama.
 */
export async function callGemini(params: GeminiCallParams): Promise<GeminiCallResult> {
  const response = await postInteraction(params, false);
  if ("error" in response) return response;

  const data = await response.json();
  const modelOutputStep = (data.steps ?? []).find((step: { type: string }) => step.type === "model_output");
  const text = modelOutputStep?.content?.find((part: { type: string }) => part.type === "text")?.text;
  if (!text || typeof data.id !== "string") {
    return { error: UNUSABLE };
  }

  return { text, interactionId: data.id };
}

type StreamEvent = {
  event_type?: string;
  interaction?: { id?: string; status?: string };
  delta?: { type?: string; text?: string };
};

/**
 * Come callGemini, ma il testo arriva a pezzi mentre il modello lo scrive (`onText` per ogni pezzo),
 * come nell'app Gemini: le prime parole arrivano in meno di un secondo invece di aspettare la
 * risposta intera (misurato il 2026-09-29: ~0,7 s contro 9-12 s). Formato verificato dal vivo: eventi
 * SSE "interaction.created" (id), "step.delta" con delta di tipo "text", "interaction.completed".
 * Se la richiesta viene rifiutata (es. memoria scaduta) l'errore arriva prima di qualunque testo.
 */
export async function streamGemini(
  params: GeminiCallParams,
  onText: (delta: string) => void
): Promise<GeminiCallResult> {
  const response = await postInteraction(params, true);
  if ("error" in response) return response;
  if (!response.body) return { error: UNUSABLE };

  let interactionId: string | null = null;
  let text = "";
  let failed = false;

  const handleEvent = (raw: string) => {
    const data = raw
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .join("");
    if (!data || data === "[DONE]") return;
    let event: StreamEvent;
    try {
      event = JSON.parse(data) as StreamEvent;
    } catch {
      return;
    }
    if (event.interaction?.id) interactionId = event.interaction.id;
    if (event.interaction?.status === "failed" || event.event_type === "error") failed = true;
    if (event.event_type === "step.delta" && event.delta?.type === "text" && event.delta.text) {
      text += event.delta.text;
      onText(event.delta.text);
    }
  };

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        handleEvent(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf("\n\n");
      }
    }
    if (buffer.trim()) handleEvent(buffer);
  } catch (error) {
    console.error("[gemini] stream interrupted", error);
    return { error: UNAVAILABLE };
  }

  if (failed || !text || !interactionId) return { error: UNUSABLE };
  return { text, interactionId };
}

// Modello per creare/modificare immagini ("Nano Banana"): NON incluso nel piano gratuito di Google,
// circa 0,034 dollari a immagine 1K (listino verificato il 2026-09-27). Usato solo se
// GEMINI_IMAGE_GENERATION_ENABLED è attivo, vedi lib/ai/communityImage.ts.
const GEMINI_IMAGE_MODEL = "gemini-3.1-flash-lite-image";

type GeminiImageResult = { data: string; mimeType: string } | { error: string };

type ImagePart = { type?: string; data?: string; mime_type?: string };

// Forma della risposta ricavata dalla documentazione, non ancora verificata dal vivo (serve la
// fatturazione attiva): cerchiamo l'immagine sia nei "steps" (come per il testo) sia in
// "output_image", così la prima prova reale non si rompe per una differenza di forma.
function findImagePart(data: {
  steps?: { type: string; content?: ImagePart[] }[];
  output_image?: ImagePart;
  interaction?: { output_image?: ImagePart };
}): ImagePart | undefined {
  const fromSteps = (data.steps ?? [])
    .flatMap((step) => step.content ?? [])
    .find((part) => part.type === "image" && part.data);
  return fromSteps ?? data.output_image ?? data.interaction?.output_image;
}

/** Crea un'immagine da una descrizione, oppure modifica `sourceImage` se passata. Come callGemini
 * non lancia mai eccezioni: ogni problema torna come `{ error }`. */
export async function generateGeminiImage(params: {
  prompt: string;
  sourceImage?: { data: string; mimeType: string };
}): Promise<GeminiImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: "AI assistant is not configured." };

  const input: GeminiInputPart[] = [{ type: "text", text: params.prompt }];
  if (params.sourceImage) {
    input.push({ type: "image", data: params.sourceImage.data, mime_type: params.sourceImage.mimeType });
  }

  let response: Response;
  try {
    response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GEMINI_IMAGE_MODEL,
        input,
        // 16:9 come le copertine Community (ritaglio in CommunityListingForm).
        response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: "16:9" },
      }),
    });
  } catch (error) {
    console.error("[gemini-image] request failed", error);
    return { error: "Image creation is unavailable right now." };
  }

  if (!response.ok) {
    console.error(`[gemini-image] request failed: ${response.status} ${await response.text().catch(() => "")}`);
    return { error: "Image creation is unavailable right now." };
  }

  const image = findImagePart(await response.json());
  if (!image?.data) return { error: "The AI didn't return an image." };
  return { data: image.data, mimeType: image.mime_type ?? "image/jpeg" };
}

/** Interpreta il testo di risposta come JSON, atteso quando la chiamata usa `responseSchema`. */
export function parseGeminiJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("[gemini] failed to parse JSON response", error, text);
    return null;
  }
}
