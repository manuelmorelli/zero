"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { getConversationForChat } from "@/lib/actions/message";
import { Avatar } from "@/components/ui/avatar";
import { ChatMessageList } from "./ChatMessageList";
import { ChatComposer } from "./ChatComposer";
import { useChatSession, type ChatMessage } from "./useChatSession";

type InlineChatProps = {
  conversationId: string;
  currentUserId: string;
  fallbackName: string;
  fallbackAvatarUrl: string | null;
  onBack: () => void;
  onClose: () => void;
};

type ConversationData = {
  otherUser: { name: string; avatarUrl: string | null };
  messages: ChatMessage[];
  canWrite: boolean;
};

/** Finestra di risposta rapida dentro il popover dell'iconcina messaggi (MessagesButtonClient):
 * stesso comportamento di ChatWindow ma senza cambiare pagina — "back" torna alla lista delle
 * conversazioni, "X" chiude tutto il popover. */
export function InlineChat({
  conversationId,
  currentUserId,
  fallbackName,
  fallbackAvatarUrl,
  onBack,
  onClose,
}: InlineChatProps) {
  const [data, setData] = useState<ConversationData | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setLoadError(false);
    getConversationForChat(conversationId).then((result) => {
      if (cancelled) return;
      if (result.error || !result.data) {
        setLoadError(true);
        return;
      }
      setData(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <Avatar name={data?.otherUser.name ?? fallbackName} avatarUrl={data?.otherUser.avatarUrl ?? fallbackAvatarUrl} size="sm" />
        <span className="flex-1 truncate text-sm font-semibold text-ink">
          {data?.otherUser.name ?? fallbackName}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {data ? (
        <InlineChatBody
          conversationId={conversationId}
          currentUserId={currentUserId}
          otherUserName={data.otherUser.name}
          initialMessages={data.messages}
          initialCanWrite={data.canWrite}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center p-8 text-sm text-ink-muted">
          {loadError ? "Couldn't load this conversation." : "Loading…"}
        </div>
      )}
    </>
  );
}

function InlineChatBody({
  conversationId,
  currentUserId,
  otherUserName,
  initialMessages,
  initialCanWrite,
}: {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  initialMessages: ChatMessage[];
  initialCanWrite: boolean;
}) {
  const chat = useChatSession(conversationId, initialMessages, initialCanWrite);

  return (
    <>
      <ChatMessageList messages={chat.messages} currentUserId={currentUserId} otherUserName={otherUserName} />
      <ChatComposer
        canWrite={chat.canWrite}
        input={chat.input}
        setInput={chat.setInput}
        sending={chat.sending}
        error={chat.error}
        otherUserName={otherUserName}
        onSubmit={(event) => chat.handleSubmit(event)}
      />
    </>
  );
}
