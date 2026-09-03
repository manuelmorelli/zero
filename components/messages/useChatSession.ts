"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessage, pollMessages, markConversationRead } from "@/lib/actions/message";
import { MESSAGE_POLL_INTERVAL_MS } from "@/lib/constants/messages";

export type ChatMessage = { id: string; senderId: string; content: string; createdAt: string };

/**
 * Logica condivisa di una conversazione aperta (lista messaggi, polling, invio, segna-come-letto),
 * usata sia dalla pagina intera (ChatWindow) sia dalla finestra di risposta rapida nell'iconcina
 * flottante (InlineChat) — solo l'intestazione cambia tra le due.
 */
export function useChatSession(
  conversationId: string,
  initialMessages: ChatMessage[],
  initialCanWrite: boolean
) {
  const [messages, setMessages] = useState(initialMessages);
  const [canWrite, setCanWrite] = useState(initialCanWrite);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef(messages);
  const markedReadRef = useRef<string | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Segna la conversazione come letta appena la finestra si apre (non al primo invio di una
  // risposta): chiamata qui, lato client, così l'aggiornamento del pallino "non letti" globale
  // (components/messages/MessagesWidget.tsx) può propagarsi subito, cosa non possibile se
  // eseguita durante il render della pagina server (vedi lib/actions/message.ts). Il guard evita
  // la doppia chiamata del mount effect in sviluppo (React Strict Mode).
  useEffect(() => {
    if (markedReadRef.current === conversationId) return;
    markedReadRef.current = conversationId;
    markConversationRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const latest = messagesRef.current[messagesRef.current.length - 1];
      const after = latest?.createdAt ?? new Date(0).toISOString();
      const result = await pollMessages(conversationId, after);
      if (result.error || !result.messages) return;

      setCanWrite(result.canWrite ?? false);
      if (result.messages.length === 0) return;
      setMessages((current) => {
        const knownIds = new Set(current.map((message) => message.id));
        const fresh = result.messages!.filter((message) => !knownIds.has(message.id));
        return fresh.length > 0 ? [...current, ...fresh] : current;
      });
    }, MESSAGE_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [conversationId]);

  async function handleSubmit(event: React.FormEvent, onSent?: () => void) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);
    const result = await sendMessage(conversationId, trimmed);
    setSending(false);

    if (result.error || !result.message) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    setInput("");
    setMessages((current) => [...current, result.message!]);
    onSent?.();
  }

  return { messages, canWrite, input, setInput, sending, error, handleSubmit };
}
