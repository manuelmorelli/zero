"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { IconButton } from "@/components/ui/button";
import { AI_MARKDOWN_COMPONENTS } from "@/components/common/aiMarkdownComponents";
import { streamSiteAssistantTurn } from "@/lib/ai/siteAssistantChatStream";
import {
  loadSiteAssistantChat,
  saveSiteAssistantChat,
  type SiteAssistantChatMessage,
  type StoredSiteAssistantChat,
} from "@/lib/ai/siteAssistantChatStorage";

const MAX_MESSAGE_LENGTH = 1000;

const WELCOME: SiteAssistantChatMessage = {
  role: "assistant",
  text: "Hi, I'm Ember, the assistant that helps you understand how Zero works. Ask me anything about Journeys, publishing, the algorithm, or where to find a setting.",
};

function freshChat(): StoredSiteAssistantChat {
  return { messages: [WELCOME], interactionId: null };
}

/**
 * Il pannello di Ember, sotto il pulsante mascotte (AiMascotButton): spiega come funziona Zero e
 * non esegue mai azioni al posto di chi lo usa. Stesso motore della chat Community
 * (lib/ai/gemini.ts) ma nel modo più semplice possibile, niente bozze, immagini o allegati: solo
 * domanda e risposta ancorata ai contenuti veri del sito (lib/ai/siteAssistant.ts). Funziona anche
 * senza login: la conversazione resta nel browser (zero:ember-chat), non è legata a un account.
 */
export function EmberChatPanel() {
  const [chat, setChat] = useState<StoredSiteAssistantChat>(() => loadSiteAssistantChat() ?? freshChat());
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveSiteAssistantChat(chat);
  }, [chat]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [chat.messages, pending, streamingText]);

  async function handleSend() {
    const message = input.trim();
    if (!message || pending) return;
    const history = chat.messages.filter((item) => !item.failed);
    setInput("");
    setChat((current) => ({ ...current, messages: [...current.messages, { role: "user", text: message }] }));
    setPending(true);

    let partial = "";
    let replied = false;
    await streamSiteAssistantTurn({ message, previousInteractionId: chat.interactionId, history }, (event) => {
      if (event.type === "text") {
        partial += event.delta;
        setStreamingText(partial);
      } else if (event.type === "reply") {
        replied = true;
        setStreamingText(null);
        setChat((current) => ({
          interactionId: event.interactionId,
          messages: [...current.messages, { role: "assistant", text: event.reply }],
        }));
      } else if (!replied) {
        setStreamingText(null);
        setChat((current) => ({
          ...current,
          messages: [...current.messages, { role: "assistant", text: event.error, failed: true }],
        }));
      }
    });
    setPending(false);
  }

  const hasConversation = chat.messages.some((message) => message.role === "user");

  return (
    <div
      role="menu"
      aria-label="Ember, Zero's assistant"
      className="relative flex max-h-[28rem] w-80 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl sm:w-96"
    >
      {/* Stessa luce della chat Community (CommunityAiChat.tsx): forte al centro a chat vuota, poi
          scende dietro la barra di scrittura una volta iniziata la conversazione. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_40%_at_50%_40%,rgba(255,255,255,0.16),transparent_70%),radial-gradient(ellipse_95%_75%_at_50%_50%,rgba(255,255,255,0.06),transparent_80%)] transition-opacity duration-700 ${
          hasConversation ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_65%_35%_at_50%_100%,rgba(255,255,255,0.12),transparent_75%)] transition-opacity duration-700 ${
          hasConversation ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles className="h-4 w-4 text-ember" aria-hidden="true" />
        <p className="text-sm font-semibold uppercase tracking-wider text-ink-faint">Ember</p>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-3 [scrollbar-color:var(--color-surface-2)_transparent] [scrollbar-width:thin]"
      >
        <div className="flex flex-col gap-4">
          {chat.messages.map((message, index) =>
            message.role === "user" ? (
              <div key={index} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-3xl bg-surface-2 px-3.5 py-2 text-sm text-ink">
                {message.text}
              </div>
            ) : (
              <div key={index} className="flex gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
                <div className={`min-w-0 flex-1 text-sm leading-relaxed ${message.failed ? "text-ink-muted" : "text-ink"}`}>
                  <ReactMarkdown components={AI_MARKDOWN_COMPONENTS}>{message.text}</ReactMarkdown>
                </div>
              </div>
            )
          )}
          {streamingText !== null ? (
            <div className="flex gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 animate-pulse text-ember" aria-hidden="true" />
              <div className="min-w-0 flex-1 text-sm leading-relaxed text-ink">
                <ReactMarkdown components={AI_MARKDOWN_COMPONENTS}>{streamingText}</ReactMarkdown>
              </div>
            </div>
          ) : (
            pending && (
              <div className="flex items-center gap-2 text-sm text-ink-faint">
                <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-ember" aria-hidden="true" />
                Thinking…
              </div>
            )
          )}
        </div>
      </div>

      <div className="border-t border-border p-3">
        {/* Stesso bordo e bagliore arancioni della barra della chat Community (CommunityAiComposer.tsx). */}
        <div className="flex items-end gap-2 rounded-[2rem] border border-ember/35 bg-surface px-1.5 py-1.5 shadow-[0_0_20px_-10px_rgba(226,145,77,45%)] transition-all duration-300 hover:border-ember/70 hover:shadow-[0_0_28px_-8px_rgba(226,145,77,70%)] focus-within:border-ember/70 focus-within:shadow-[0_0_28px_-8px_rgba(226,145,77,70%)]">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Ask Ember anything about Zero"
            maxLength={MAX_MESSAGE_LENGTH}
            className="max-h-24 min-h-9 flex-1 resize-none self-center bg-transparent px-2.5 py-1 text-sm text-ink outline-none [field-sizing:content] placeholder:text-ink-faint"
          />
          <IconButton onClick={handleSend} disabled={!input.trim() || pending} aria-label="Send">
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
