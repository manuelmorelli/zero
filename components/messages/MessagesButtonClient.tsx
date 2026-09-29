"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { InlineChat } from "./InlineChat";

type ConversationItem = {
  id: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

type MessagesButtonClientProps = {
  unreadCount: number;
  conversations: ConversationItem[];
  currentUserId: string;
};

export function MessagesButtonClient({ unreadCount, conversations, currentUserId }: MessagesButtonClientProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ConversationItem | null>(null);
  // Aggiornamento ottimistico: appena una conversazione viene aperta qui, il suo pallino sparisce
  // subito dalla lista invece di aspettare che la revalidation del layout radice si propaghi
  // (vedi lib/actions/message.ts:markConversationRead).
  const [locallyRead, setLocallyRead] = useState<Set<string>>(new Set());

  const displayedUnreadCount = conversations.reduce(
    (sum, conversation) => sum + (locallyRead.has(conversation.id) ? 0 : conversation.unreadCount),
    0
  );

  function closeAll() {
    setOpen(false);
    setActive(null);
  }

  function openConversation(conversation: ConversationItem) {
    setActive(conversation);
    if (conversation.unreadCount > 0) {
      setLocallyRead((current) => new Set(current).add(conversation.id));
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Messages"
        // Terzo pulsante impilato sopra "+" e la campanella (stesso pattern, vedi
        // components/layout/NotificationBellButton.tsx): +/campanella occupano già
        // 8.5rem di altezza totale da terra, questo si aggiunge sopra con lo stesso gap.
        style={{ bottom: "calc(max(1.5rem, env(safe-area-inset-bottom)) + 7.75rem)" }}
        className="fixed right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-ember-line bg-surface text-ink shadow-xl transition-transform hover:scale-105 active:scale-95"
      >
        <MessageIcon className="h-5 w-5" />
        {displayedUnreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-sm font-bold text-bg">
            {displayedUnreadCount > 9 ? "9+" : displayedUnreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={closeAll} />
          <div
            role="menu"
            aria-label="Messages panel"
            style={{ bottom: "calc(max(1.5rem, env(safe-area-inset-bottom)) + 11.25rem)" }}
            className="fixed right-5 z-40 flex max-h-[70vh] w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
          >
            {active ? (
              <InlineChat
                conversationId={active.id}
                currentUserId={currentUserId}
                fallbackName={active.otherUserName}
                fallbackAvatarUrl={active.otherUserAvatarUrl}
                onBack={() => setActive(null)}
                onClose={closeAll}
              />
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold uppercase tracking-wider text-ink-faint">Messages</p>
                  <Link
                    href="/messages"
                    onClick={closeAll}
                    className="text-sm font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
                  >
                    View All
                  </Link>
                </div>

                <div className="overflow-y-auto">
                  {conversations.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-ink-muted">No conversations yet.</p>
                  ) : (
                    conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => openConversation(conversation)}
                        className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-surface-2"
                      >
                        <Avatar name={conversation.otherUserName} avatarUrl={conversation.otherUserAvatarUrl} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-ink">{conversation.otherUserName}</span>
                            <span className="shrink-0 text-sm text-ink-faint">
                              {formatRelativeDate(new Date(conversation.lastMessageAt))}
                            </span>
                          </span>
                          <span className="mt-0.5 line-clamp-1 text-sm text-ink-muted">
                            {conversation.lastMessagePreview ?? "No messages yet"}
                          </span>
                        </span>
                        {conversation.unreadCount > 0 && !locallyRead.has(conversation.id) && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-danger" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} className={className} aria-hidden="true">
      <path
        d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v6A1.5 1.5 0 0 1 15.5 13H8l-3.5 3v-3H4.5A1.5 1.5 0 0 1 3 11.5v-6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
