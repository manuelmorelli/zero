import { continueSiteAssistantChat, type SiteAssistantMessage } from "@/lib/ai/siteAssistant";
import { isSiteAssistantRateLimited } from "@/lib/ai/assistantRateLimit";

const MAX_MESSAGE_LENGTH = 1000;
// La conversazione arriva dal browser (resta salvata lì, non in un account): la accorciamo sempre
// qui, così un client manomesso non può mandare a Gemini testi enormi.
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_MESSAGE_LENGTH = 2000;

type AssistantStreamEvent =
  | { type: "text"; delta: string }
  | { type: "reply"; reply: string; interactionId: string }
  | { type: "error"; error: string };

function sanitizeHistory(raw: unknown): SiteAssistantMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is SiteAssistantMessage =>
        (item?.role === "user" || item?.role === "assistant") && typeof item?.text === "string"
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({ role: item.role, text: item.text.slice(0, MAX_HISTORY_MESSAGE_LENGTH) }));
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * Un turno della chat di Ember, l'assistente che spiega come funziona Zero (lib/ai/siteAssistant.ts).
 * A differenza della chat Community (app/api/community-ai/chat/route.ts) non richiede login: è
 * pensata anche per chi visita il sito senza account, quindi protetta solo da un limite di
 * messaggi per indirizzo IP (lib/ai/assistantRateLimit.ts), non da un controllo di sessione.
 */
export async function POST(request: Request) {
  if (isSiteAssistantRateLimited(clientIp(request))) {
    return new Response("Too many messages, try again later.", { status: 429 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const message = typeof raw.message === "string" ? raw.message.trim().slice(0, MAX_MESSAGE_LENGTH) : "";
  if (!message) return new Response("Bad request", { status: 400 });

  const previousInteractionId = typeof raw.previousInteractionId === "string" ? raw.previousInteractionId : null;
  const history = sanitizeHistory(raw.history);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AssistantStreamEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      const result = await continueSiteAssistantChat({
        message,
        previousInteractionId,
        history,
        onText: (delta) => send({ type: "text", delta }),
      });

      if ("error" in result) send({ type: "error", error: result.error });
      else send({ type: "reply", reply: result.reply, interactionId: result.interactionId });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
