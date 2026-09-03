"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "./useChatSession";

type ChatMessageListProps = {
  messages: ChatMessage[];
  currentUserId: string;
  otherUserName: string;
};

export function ChatMessageList({ messages, currentUserId, otherUserName }: ChatMessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  return (
    <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-muted">
          {`Say hello to ${otherUserName}.`}
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
  );
}
