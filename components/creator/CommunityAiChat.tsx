"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { sendCommunityAiMessage } from "@/lib/actions/communityAi";
import { COMMUNITY_LISTING_LABELS, type CommunityListingType } from "@/lib/constants/communityListing";
import type { CommunityListingDraft } from "@/components/creator/CommunityListingForm";

type ChatMessage = { role: "user" | "assistant"; text: string };

type PendingDraft = { type: CommunityListingType; draft: CommunityListingDraft };

function welcomeMessage(creatorFirstName: string | null): ChatMessage {
  const greeting = creatorFirstName ? `Hi ${creatorFirstName}!` : "Hi!";
  return {
    role: "assistant",
    text: `${greeting} What would you like to create today? A workshop, an event, a digital product or a 1:1 service. Describe it in your own words and I'll prepare a draft for you to check.`,
  };
}

/** Assistente "personale" della pagina Community (Punto 8 dell'allineamento, 2026-09-25): una vera
 * chat, non un singolo box — Manuel l'ha chiesta così esplicitamente ("facile, intuitivo,
 * futuristico"). Dietro le quinte resta comunque semplice: ogni turno è una singola chiamata a
 * Gemini (lib/ai/communityDraft.ts), nessuno storico salvato da Zero (lo tiene Gemini via
 * interactionId). Quando la bozza è pronta, il creator la apre nel modulo vero e la conferma lui. */
export function CommunityAiChat({
  creatorFirstName,
  onDraftReady,
}: {
  creatorFirstName: string | null;
  onDraftReady: (pending: PendingDraft) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [welcomeMessage(creatorFirstName)]);
  const [input, setInput] = useState("");
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [readyDraft, setReadyDraft] = useState<PendingDraft | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scende da solo all'ultimo messaggio (e all'indicatore "Thinking…"), come in ogni app di chat.
  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, pending, readyDraft]);

  async function handleSend() {
    const message = input.trim();
    if (!message || pending) return;

    setMessages((current) => [...current, { role: "user", text: message }]);
    setInput("");
    setPending(true);

    const result = await sendCommunityAiMessage(message, interactionId);

    if ("error" in result) {
      setMessages((current) => [...current, { role: "assistant", text: result.error }]);
      setPending(false);
      return;
    }

    setInteractionId(result.interactionId);
    setMessages((current) => [...current, { role: "assistant", text: result.reply }]);
    // Una risposta senza bozza non cancella quella precedente: il pulsante resta finché ce n'è una.
    if (result.draft) {
      setReadyDraft({ type: result.draft.type, draft: result.draft });
    }
    setPending(false);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <Sparkles className="h-4 w-4 text-ember" aria-hidden="true" />
        <span className="text-sm font-semibold text-ink">Create with AI</span>
      </div>

      <div ref={scrollRef} className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              message.role === "user"
                ? "ml-auto bg-ink text-bg"
                : "bg-surface-2 text-ink"
            }`}
          >
            {message.text}
          </div>
        ))}
        {pending && (
          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Thinking…
          </div>
        )}
      </div>

      {readyDraft && (
        <div className="border-t border-border/60 px-4 py-3">
          <button
            type="button"
            onClick={() => onDraftReady(readyDraft)}
            className="w-full rounded-full bg-ember px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ember/90"
          >
            Fill the {COMMUNITY_LISTING_LABELS[readyDraft.type]} form with this
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-border/60 p-3">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder="e.g. a free workshop about running on Feb 23rd"
          maxLength={500}
          className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={pending || !input.trim()}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-bg transition-colors hover:bg-ink-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
