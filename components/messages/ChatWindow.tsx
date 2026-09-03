"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { Avatar } from "./Avatar";
import { ChatMessageList } from "./ChatMessageList";
import { ChatComposer } from "./ChatComposer";
import { useChatSession, type ChatMessage } from "./useChatSession";

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
  const chat = useChatSession(conversationId, initialMessages, initialCanWrite);

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
        <Avatar name={otherUser.name} avatarUrl={otherUser.avatarUrl} size="h-8 w-8" />
        <span className="flex-1 text-sm font-semibold text-ink">{otherUser.name}</span>
        <Link
          href="/messages"
          aria-label="Close conversation"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <ChatMessageList messages={chat.messages} currentUserId={currentUserId} otherUserName={otherUser.name} />

      <ChatComposer
        canWrite={chat.canWrite}
        input={chat.input}
        setInput={chat.setInput}
        sending={chat.sending}
        error={chat.error}
        otherUserName={otherUser.name}
        onSubmit={(event) => chat.handleSubmit(event, () => router.refresh())}
      />
    </div>
  );
}
