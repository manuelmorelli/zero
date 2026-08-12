"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";

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
};

export function MessagesButtonClient({ unreadCount, conversations }: MessagesButtonClientProps) {
  const [open, setOpen] = useState(false);

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
        className="fixed right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-xl shadow-black/40 transition-transform hover:scale-105 active:scale-95"
      >
        <MessageIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-bg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            role="menu"
            aria-label="Messages panel"
            style={{ bottom: "calc(max(1.5rem, env(safe-area-inset-bottom)) + 11.25rem)" }}
            className="fixed right-5 z-40 flex max-h-[70vh] w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/40"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Messages</p>
              <Link
                href="/messages"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
              >
                View all
              </Link>
            </div>

            <div className="overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-muted">No conversations yet.</p>
              ) : (
                conversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/messages/${conversation.id}`}
                    onClick={() => setOpen(false)}
                    className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-surface-2"
                  >
                    <Avatar name={conversation.otherUserName} avatarUrl={conversation.otherUserAvatarUrl} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-ink">{conversation.otherUserName}</span>
                        <span className="shrink-0 text-[11px] text-ink-faint">
                          {formatRelativeDate(new Date(conversation.lastMessageAt))}
                        </span>
                      </span>
                      <span className="mt-0.5 line-clamp-1 text-xs text-ink-muted">
                        {conversation.lastMessagePreview ?? "No messages yet"}
                      </span>
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-danger" />
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink-muted">
      {initials}
    </span>
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
