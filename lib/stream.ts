import { getVideoPlaybackUrl } from "@/lib/r2";

// Video ottimizzati per connessioni lente (piano approvato da Manuel, 2026-09-07): Cloudflare
// Stream genera in background una versione a streaming adattivo del video già su R2, senza mai
// toccare l'originale caricato dal creator (vedi Episode.videoKey). Finché Stream non è collegato
// (variabili d'ambiente assenti, es. in sviluppo prima della configurazione dell'account), tutte
// le funzioni qui sotto restano no-op: l'app si comporta come oggi, video originale sempre servito.

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
const webhookSecret = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET;

const API_BASE = "https://api.cloudflare.com/client/v4";

export function isStreamConfigured(): boolean {
  return Boolean(accountId && apiToken);
}

type StreamCopyResponse = {
  success: boolean;
  result?: { uid: string };
  errors?: { message: string }[];
};

/** Avvia su Cloudflare Stream la creazione della versione leggera di un video già su R2,
 * passandogli come sorgente un URL di lettura temporaneo (Stream lo scarica lui stesso). Non
 * aspetta che l'elaborazione finisca (richiede minuti): restituisce subito lo uid del video su
 * Stream, che risulta "pronto" più tardi via webhook (vedi app/api/webhooks/stream/route.ts) o,
 * come rete di sicurezza, via il controllo giornaliero (vedi app/api/cron/sync-light-videos). */
export async function startLightVideoEncoding(videoKey: string): Promise<string | null> {
  if (!isStreamConfigured()) return null;

  try {
    const sourceUrl = await getVideoPlaybackUrl(videoKey);
    const response = await fetch(`${API_BASE}/accounts/${accountId}/stream/copy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: sourceUrl,
        requireSignedURLs: false,
      }),
    });
    const data = (await response.json()) as StreamCopyResponse;
    return data.success && data.result?.uid ? data.result.uid : null;
  } catch {
    return null;
  }
}

/** Cancella la versione leggera su Stream: usata quando il video originale di un episodio viene
 * sostituito o l'episodio eliminato, per non lasciare copie orfane a occupare spazio fatturato. */
export async function deleteLightVideo(streamVideoId: string): Promise<void> {
  if (!isStreamConfigured()) return;
  await fetch(`${API_BASE}/accounts/${accountId}/stream/${streamVideoId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${apiToken}` },
  }).catch(() => {});
}

type StreamVideoDetails = {
  state: "ready" | "pending" | "error";
  hlsUrl: string | null;
};

type StreamStatusResponse = {
  success: boolean;
  result?: {
    readyToStream: boolean;
    status: { state: string };
    playback?: { hls?: string };
  };
};

/** Interroga Stream per lo stato attuale di un video (e il suo URL di playback una volta pronto):
 * usata solo dal controllo giornaliero di riserva, il percorso normale è il webhook (istantaneo,
 * non richiede polling). */
export async function getLightVideoDetails(streamVideoId: string): Promise<StreamVideoDetails | null> {
  if (!isStreamConfigured()) return null;
  try {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/stream/${streamVideoId}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    const data = (await response.json()) as StreamStatusResponse;
    if (!data.success || !data.result) return null;
    if (data.result.readyToStream) {
      return { state: "ready", hlsUrl: data.result.playback?.hls ?? null };
    }
    if (data.result.status.state === "error") return { state: "error", hlsUrl: null };
    return { state: "pending", hlsUrl: null };
  } catch {
    return null;
  }
}

/** Verifica la firma HMAC-SHA256 del webhook Cloudflare Stream (header "Webhook-Signature":
 * "time=...,sig1=..."), vedi app/api/webhooks/stream/route.ts. Il corpo deve essere il testo
 * grezzo della richiesta (request.text()), non il JSON già parsato: la firma è calcolata sui
 * byte esatti inviati da Cloudflare. */
export async function verifyStreamWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): Promise<boolean> {
  if (!webhookSecret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const time = parts.time;
  const signature = parts.sig1;
  if (!time || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${time}.${rawBody}`));
  const expected = Array.from(new Uint8Array(mac))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
