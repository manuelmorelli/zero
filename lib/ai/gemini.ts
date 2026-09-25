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

export type GeminiInputPart = { type: "text"; text: string } | { type: "image"; data: string; mime_type: string };

type GeminiCallParams = {
  input: string | GeminiInputPart[];
  systemInstruction?: string;
  previousInteractionId?: string;
  responseSchema?: object;
};

type GeminiCallResult = { text: string; interactionId: string } | { error: string };

/**
 * Chiamata di basso livello, condivisa da moderazione (lib/moderation.ts) e dall'assistente di
 * creazione Community (lib/ai/communityDraft.ts). Non lancia mai un'eccezione: un problema di rete
 * o della chiave mancante torna come `{ error }`, mai un crash della pagina che la chiama.
 */
export async function callGemini(params: GeminiCallParams): Promise<GeminiCallResult> {
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

  let response: Response;
  try {
    response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("[gemini] request failed", error);
    return { error: "The AI assistant is unavailable right now." };
  }

  if (!response.ok) {
    console.error(`[gemini] request failed: ${response.status} ${await response.text().catch(() => "")}`);
    return { error: "The AI assistant is unavailable right now." };
  }

  const data = await response.json();
  const modelOutputStep = (data.steps ?? []).find((step: { type: string }) => step.type === "model_output");
  const text = modelOutputStep?.content?.find((part: { type: string }) => part.type === "text")?.text;
  if (!text || typeof data.id !== "string") {
    return { error: "The AI assistant didn't return a usable answer." };
  }

  return { text, interactionId: data.id };
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
