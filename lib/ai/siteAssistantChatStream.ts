import type { SiteAssistantMessage } from "@/lib/ai/siteAssistant";

/**
 * Cosa manda il server durante un turno della chat di Ember, una riga JSON per evento: i pezzi di
 * testo mentre scrive, poi la risposta completa. Niente bozza o immagine, a differenza della chat
 * Community (lib/communityAiChatStream.ts): Ember spiega soltanto. Condiviso tra
 * app/api/ai/assistant/route.ts e il pannello.
 */
export type SiteAssistantStreamEvent =
  | { type: "text"; delta: string }
  | { type: "reply"; reply: string; interactionId: string }
  | { type: "error"; error: string };

const ASSISTANT_CHAT_ENDPOINT = "/api/ai/assistant";
const CONNECTION_ERROR = "Ember is unavailable right now.";

/** Lato pagina: manda il messaggio e chiama `onEvent` per ogni evento appena arriva. Un problema di
 * rete diventa un normale evento "error", mai un'eccezione. */
export async function streamSiteAssistantTurn(
  body: { message: string; previousInteractionId: string | null; history: SiteAssistantMessage[] },
  onEvent: (event: SiteAssistantStreamEvent) => void
): Promise<void> {
  let sawEnd = false;
  const handleLine = (line: string) => {
    if (!line.trim()) return;
    try {
      const event = JSON.parse(line) as SiteAssistantStreamEvent;
      if (event.type === "reply" || event.type === "error") sawEnd = true;
      onEvent(event);
    } catch {
      // Riga non leggibile: gestita sotto come errore.
    }
  };

  try {
    const response = await fetch(ASSISTANT_CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok || !response.body) throw new Error(`status ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      lines.forEach(handleLine);
    }
    handleLine(buffer);
  } catch {
    // Gestito sotto: se la risposta non è arrivata fino in fondo, si segnala come errore.
  }

  if (!sawEnd) onEvent({ type: "error", error: CONNECTION_ERROR });
}
