"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { sendMessage, pollMessages, markConversationRead } from "@/lib/actions/message";
import { MESSAGE_MAX_LENGTH, MESSAGE_POLL_INTERVAL_MS } from "@/lib/constants/messages";

type ChatMessage = { id: string; senderId: string; content: string; createdAt: string };

type ChatWindowProps = {
  conversationId: string;
  currentUserId: string;
  otherUser: { name: string; avatarUrl: string | null };
  initialMessages: ChatMessage[];
  initialCanWrite: boolean;
};

export function ChatWindow({
  conversationId,
  currentUserId,
  otherUser,
  initialMessages,
  initialCanWrite,
}: ChatWindowProps) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [canWrite, setCanWrite] = useState(initialCanWrite);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  const markedReadRef = useRef<string | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
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

  async function handleSubmit(event: React.FormEvent) {
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
    router.refresh();
  }

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
        <Avatar name={otherUser.name} avatarUrl={otherUser.avatarUrl} />
        <span className="flex-1 text-sm font-semibold text-ink">{otherUser.name}</span>
        <Link
          href="/messages"
          aria-label="Close conversation"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-muted">
            {`Say hello to ${otherUser.name}.`}
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={
                message.senderId === currentUserId
                  ? "ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-ink px-3.5 py-2.5 text-sm text-bg"
                  : "max-w-[80%] rounded-2xl rounded-tl-sm bg-surface-2 px-3.5 py-2.5 text-sm text-ink"
              }
            >
              {message.content}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border p-3">
        {canWrite ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={MESSAGE_MAX_LENGTH}
              placeholder={`Message ${otherUser.name}…`}
              disabled={sending}
              className="w-full rounded-full border border-border bg-surface-2 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
            >
              Send
            </button>
          </form>
        ) : (
          <p className="text-center text-xs text-ink-faint">
            You can only message people you follow, or who follow you.
          </p>
        )}
        {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}
      </div>
    </div>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />;
  }
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink-muted">
      {initials}
    </span>
  );
}
