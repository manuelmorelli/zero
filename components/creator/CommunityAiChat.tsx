"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Loader2, Send, Sparkles } from "lucide-react";
import { sendCommunityAiMessage } from "@/lib/actions/communityAi";
import { COMMUNITY_LISTING_LABELS } from "@/lib/constants/communityListing";
import {
  loadCommunityAiChat,
  saveCommunityAiChat,
  type CommunityAiChatMessage,
  type CommunityAiPendingDraft,
  type StoredCommunityAiChat,
} from "@/lib/communityAiChatStorage";

function welcomeMessage(creatorFirstName: string | null): CommunityAiChatMessage {
  const greeting = creatorFirstName ? `Hi ${creatorFirstName}!` : "Hi!";
  return {
    role: "assistant",
    text: `${greeting} What would you like to create today? A workshop, an event, a digital product or a 1:1 service. Describe it in your own words and I'll prepare a draft for you to check.`,
  };
}

// Le risposte dell'AI arrivano in Markdown (grassetti, elenchi) come su Gemini: qui solo la
// spaziatura, i colori restano quelli della bolla del messaggio.
const MARKDOWN_COMPONENTS: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
      {children}
    </a>
  ),
};

/** Assistente AI della pagina Community (Punto 8 dell'allineamento): una chat libera come su
 * Gemini, che intanto prepara dietro le quinte una bozza (lib/ai/communityDraft.ts). La bozza non
 * viene mai salvata da sola: il creator la apre nel modulo vero e la conferma lui. La conversazione
 * resta salvata nel browser fino al logout (lib/communityAiChatStorage.ts). */
export function CommunityAiChat({
  userId,
  creatorFirstName,
  onDraftReady,
}: {
  userId: string;
  creatorFirstName: string | null;
  onDraftReady: (pending: CommunityAiPendingDraft) => void;
}) {
  const [chat, setChat] = useState<StoredCommunityAiChat>(
    () =>
      loadCommunityAiChat(userId) ?? {
        messages: [welcomeMessage(creatorFirstName)],
        interactionId: null,
        readyDraft: null,
        draftStartIndex: 0,
      }
  );
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveCommunityAiChat(userId, chat);
  }, [userId, chat]);

  // Scende da solo all'ultimo messaggio (e all'indicatore "Thinking…"), come in ogni app di chat.
  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [chat.messages, chat.readyDraft, pending]);

  async function handleSend() {
    const message = input.trim();
    if (!message || pending) return;

    const conversation = chat.messages.filter((item) => !item.failed);
    const draftConversation = chat.messages.slice(chat.draftStartIndex).filter((item) => !item.failed);

    setChat((current) => ({ ...current, messages: [...current.messages, { role: "user", text: message }] }));
    setInput("");
    setPending(true);

    const result = await sendCommunityAiMessage({
      message,
      previousInteractionId: chat.interactionId,
      history: conversation,
      draftConversation,
    });

    if ("error" in result) {
      setChat((current) => ({
        ...current,
        messages: [...current.messages, { role: "assistant", text: result.error, failed: true }],
      }));
    } else {
      setChat((current) => ({
        ...current,
        interactionId: result.interactionId,
        messages: [...current.messages, { role: "assistant", text: result.reply }],
        // Una risposta senza bozza non cancella quella precedente: il pulsante resta finché ce n'è una.
        readyDraft: result.draft ? { type: result.draft.type, draft: result.draft } : current.readyDraft,
      }));
    }
    setPending(false);
  }

  const { readyDraft } = chat;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <Sparkles className="h-4 w-4 text-ember" aria-hidden="true" />
        <span className="text-sm font-semibold text-ink">Create with AI</span>
      </div>

      <div ref={scrollRef} className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4">
        {chat.messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              message.role === "user"
                ? "ml-auto whitespace-pre-wrap bg-ink text-bg"
                : "bg-surface-2 text-ink"
            }`}
          >
            {message.role === "assistant" ? (
              <ReactMarkdown components={MARKDOWN_COMPONENTS}>{message.text}</ReactMarkdown>
            ) : (
              message.text
            )}
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
          maxLength={2000}
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
