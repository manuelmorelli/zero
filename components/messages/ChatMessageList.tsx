"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/ui/chat";
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
          <MessageBubble key={message.id} mine={message.senderId === currentUserId}>
            {message.content}
          </MessageBubble>
        ))
      )}
    </div>
  );
}
