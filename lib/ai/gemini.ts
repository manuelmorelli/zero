import https from "node:https";

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
  | { type: "document"; data: string; mime_type: string }
  // Sempre un file già caricato (uri), mai inline: i video degli episodi possono arrivare fino a
  // 1GB (MAX_VIDEO_SIZE_BYTES), ben oltre il limite di 100MB per i dati inline delle Interactions
  // API. "processing: agentic" fa decidere all'AI quali parti del video guardare con attenzione
  // invece di analizzarlo per intero a ritmo fisso (molto più economico, verificato nella
  // documentazione Google del 2026).
  | { type: "video"; uri: string; mime_type: string; processing?: "agentic" };

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

const FILES_UPLOAD_ENDPOINT = "https://generativelanguage.googleapis.com/upload/v1beta/files";

type GeminiFileResult = { uri: string; name: string } | { error: string };

type RawHttpResponse = { status: number; headers: Record<string, string | string[] | undefined>; text: string };

// Episodi reali possono pesare centinaia di MB (video non compressi, vedi lib/constants/video.ts):
// scrivere tutto il corpo in un colpo solo con un singolo write() rischia di saturare il buffer
// interno del socket, che poi resta fermo in attesa che si svuoti finché Node non lo segnala come
// bloccato — visto dal vivo il 2026-10-02 su un file di 459MB ("Request timed out" dopo 10 minuti
// di nessuna attività). Scrivere a blocchi da 1MB, aspettando l'evento "drain" quando il socket è
// pieno, evita il blocco e mantiene il timeout "vivo" perché il socket resta sempre attivo.
const UPLOAD_CHUNK_BYTES = 1024 * 1024;

function writeInChunks(req: import("node:http").ClientRequest, body: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    let offset = 0;
    req.on("error", reject);
    function writeNext() {
      if (offset >= body.length) {
        req.end();
        resolve();
        return;
      }
      const chunk = body.subarray(offset, Math.min(offset + UPLOAD_CHUNK_BYTES, body.length));
      offset += chunk.length;
      if (req.write(chunk)) writeNext();
      else req.once("drain", writeNext);
    }
    writeNext();
  });
}

/**
 * Richiesta HTTP con il modulo nativo `https` di Node invece di `fetch`: verificato dal vivo che
 * `fetch` (basato su undici) chiude la connessione con "HeadersTimeoutError" sugli upload di video
 * di dimensione reale, anche quando il video stesso è solo di pochi minuti — probabile limite
 * interno pensato per richieste normali, non per invii pesanti. Usata solo qui, per l'unico punto
 * del progetto che manda file di decine/centinaia di MB in un corpo di richiesta. Timeout alto (30
 * minuti): un episodio vicino al limite di caricamento (1GB) può impiegare a lungo su una linea non
 * velocissima, meglio aspettare che fallire un'elaborazione altrimenti riuscita.
 */
function httpsRequest(params: {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: Uint8Array;
}): Promise<RawHttpResponse> {
  return new Promise((resolve, reject) => {
    const target = new URL(params.url);
    const req = https.request(
      {
        hostname: target.hostname,
        path: `${target.pathname}${target.search}`,
        method: params.method,
        headers: params.headers,
        timeout: 30 * 60 * 1000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({ status: res.statusCode ?? 0, headers: res.headers, text: Buffer.concat(chunks).toString("utf-8") });
        });
      }
    );
    req.on("timeout", () => req.destroy(new Error("Request timed out")));
    req.on("error", reject);
    if (params.body) writeInChunks(req, params.body).catch(reject);
    else req.end();
  });
}

/**
 * Carica un file pesante (un video) sui server di Gemini perché l'AI possa guardarlo: usato solo
 * per i video, troppo grandi per stare "inline" dentro l'input come invece fanno immagini e PDF.
 * Protocollo "resumable" in due passi, verificato dalla documentazione Google del 2026 (nessuna
 * libreria ufficiale, come il resto di questo file). Il file caricato è temporaneo (Google lo
 * cancella da solo dopo circa 48 ore): la memoria vera e permanente di Zero è quella scritta nel
 * nostro database da chi chiama questa funzione (lib/ai/episodeMoments.ts), non questo file.
 */
export async function uploadGeminiFile(bytes: Buffer, mimeType: string): Promise<GeminiFileResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: "AI assistant is not configured." };

  let start: RawHttpResponse;
  try {
    start = await httpsRequest({
      url: `${FILES_UPLOAD_ENDPOINT}?key=${apiKey}`,
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(bytes.length),
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": "application/json",
      },
      body: new TextEncoder().encode(JSON.stringify({ file: { display_name: "zero-episode" } })),
    });
  } catch (error) {
    console.error("[gemini-file] upload start failed", error);
    return { error: "Video upload is unavailable right now." };
  }
  const uploadUrlHeader = start.headers["x-goog-upload-url"];
  const uploadUrl = Array.isArray(uploadUrlHeader) ? uploadUrlHeader[0] : uploadUrlHeader;
  if (start.status < 200 || start.status >= 300 || !uploadUrl) {
    console.error(`[gemini-file] upload start failed: ${start.status} ${start.text}`);
    return { error: "Video upload is unavailable right now." };
  }

  let finish: RawHttpResponse;
  try {
    finish = await httpsRequest({
      url: uploadUrl,
      method: "POST",
      headers: {
        "Content-Length": String(bytes.length),
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize",
      },
      body: new Uint8Array(bytes),
    });
  } catch (error) {
    console.error("[gemini-file] upload finalize failed", error);
    return { error: "Video upload is unavailable right now." };
  }
  if (finish.status < 200 || finish.status >= 300) {
    console.error(`[gemini-file] upload finalize failed: ${finish.status} ${finish.text}`);
    return { error: "Video upload is unavailable right now." };
  }

  const data = JSON.parse(finish.text);
  const file = data.file as { uri?: string; name?: string } | undefined;
  if (!file?.uri || !file?.name) return { error: "Video upload didn't return a usable file." };
  return { uri: file.uri, name: file.name };
}

/**
 * Un video appena caricato resta per qualche secondo in elaborazione ("PROCESSING") prima di poter
 * essere analizzato. Controlla ogni 5 secondi, fino a 2 minuti in tutto (i video brevi diventano
 * pronti in pochi secondi); oltre quel tempo rinuncia invece di bloccare la richiesta a lungo.
 */
export async function waitForGeminiFileActive(fileName: string): Promise<boolean> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return false;

  for (let attempt = 0; attempt < 24; attempt++) {
    let response: Response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}`, {
        headers: { "x-goog-api-key": apiKey },
      });
    } catch (error) {
      console.error("[gemini-file] status check failed", error);
      return false;
    }
    if (!response.ok) return false;
    const data = await response.json();
    if (data.state === "ACTIVE") return true;
    if (data.state === "FAILED") return false;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return false;
}

const EMBEDDING_MODEL = "gemini-embedding-2";

/**
 * La "firma numerica" del significato di un testo: due descrizioni che parlano della stessa cosa
 * hanno numeri vicini anche se usano parole diverse. Serve per cercare nella Mappa dei Momenti per
 * senso invece che per parola esatta (ricerca semantica, non ancora costruita: questa funzione
 * prepara solo il dato). Endpoint diverso dall'Interactions API, verificato a parte.
 */
export async function embedGeminiText(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`,
      {
        method: "POST",
        headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ content: { parts: [{ text }] } }),
      }
    );
  } catch (error) {
    console.error("[gemini-embed] request failed", error);
    return null;
  }
  if (!response.ok) {
    console.error(`[gemini-embed] request failed: ${response.status} ${await response.text().catch(() => "")}`);
    return null;
  }
  const data = await response.json();
  // Verificato dal vivo il 2026-10-02: il campo è "embedding.values" (singolare), non
  // "embeddings[0].values" come indicato da un riassunto di terze parti della documentazione.
  const values = data.embedding?.values;
  if (!Array.isArray(values)) {
    console.error("[gemini-embed] unexpected response shape", JSON.stringify(data).slice(0, 300));
    return null;
  }
  return values;
}
