import type { CommunityDraft } from "@/lib/ai/communityDraft";

/**
 * Cosa manda il server durante un turno della chat AI Community, una riga JSON per evento:
 * i pezzi di testo mentre l'AI scrive, poi la risposta completa, poi la bozza (preparata dopo,
 * mentre il creator legge). Condiviso tra app/api/community-ai/chat/route.ts e la pagina.
 */
export type CommunityAiStreamEvent =
  | { type: "text"; delta: string }
  | { type: "reply"; reply: string; interactionId: string; imageKey: string | null }
  | { type: "draft"; draft: CommunityDraft | null }
  | { type: "error"; error: string };

const COMMUNITY_AI_CHAT_ENDPOINT = "/api/community-ai/chat";
const CONNECTION_ERROR = "The AI assistant is unavailable right now.";

/** Lato pagina: manda il messaggio e chiama `onEvent` per ogni evento appena arriva. Un problema
 * di rete diventa un normale evento "error", mai un'eccezione. */
export async function streamCommunityAiTurn(
  body: Record<string, unknown>,
  onEvent: (event: CommunityAiStreamEvent) => void
): Promise<void> {
  let sawEnd = false;
  const handleLine = (line: string) => {
    if (!line.trim()) return;
    try {
      const event = JSON.parse(line) as CommunityAiStreamEvent;
      if (event.type === "draft" || event.type === "error") sawEnd = true;
      onEvent(event);
    } catch {
      // Riga non leggibile (es. pagina di login al posto della risposta): gestita sotto come errore.
    }
  };

  try {
    const response = await fetch(COMMUNITY_AI_CHAT_ENDPOINT, {
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
