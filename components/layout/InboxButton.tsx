"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notification";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { InlineChat } from "@/components/messages/InlineChat";

type InboxItem =
  | { kind: "notification"; id: string; content: string; link: string | null; read: boolean; at: string }
  | {
      kind: "message";
      id: string;
      otherUserName: string;
      otherUserAvatarUrl: string | null;
      lastMessagePreview: string | null;
      at: string;
      unreadCount: number;
    };

type InboxButtonProps = {
  unreadCount: number;
  items: InboxItem[];
  currentUserId: string;
};

/**
 * Campanella unica per notifiche e messaggi (su richiesta di Manuel, 2026-10-29: prima erano due
 * pulsanti separati, troppo vicini/sovrapposti su mobile). Un solo pannello con tutto dentro,
 * ordinato per data: ogni riga porta il proprio simbolo (campanella per una notifica, fumetto per
 * un messaggio) per restare distinguibile a colpo d'occhio.
 */
export function InboxButton({ unreadCount, items: initialItems, currentUserId }: InboxButtonProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [unread, setUnread] = useState(unreadCount);
  const [activeConversation, setActiveConversation] = useState<Extract<InboxItem, { kind: "message" }> | null>(null);

  function handleMarkAllRead() {
    const unreadNotifications = items.some((item) => item.kind === "notification" && !item.read);
    if (!unreadNotifications) return;
    setItems((current) => current.map((item) => (item.kind === "notification" ? { ...item, read: true } : item)));
    setUnread((count) =>
      Math.max(
        0,
        count - items.filter((item) => item.kind === "notification" && !item.read).length
      )
    );
    markAllNotificationsRead();
  }

  function handleOpenNotification(item: Extract<InboxItem, { kind: "notification" }>) {
    if (!item.read) {
      setItems((current) =>
        current.map((entry) => (entry.kind === "notification" && entry.id === item.id ? { ...entry, read: true } : entry))
      );
      setUnread((count) => Math.max(0, count - 1));
      markNotificationRead(item.id);
    }
    setOpen(false);
  }

  function handleOpenMessage(item: Extract<InboxItem, { kind: "message" }>) {
    if (item.unreadCount > 0) {
      setItems((current) =>
        current.map((entry) => (entry.kind === "message" && entry.id === item.id ? { ...entry, unreadCount: 0 } : entry))
      );
      setUnread((count) => Math.max(0, count - item.unreadCount));
    }
    setActiveConversation(item);
  }

  function closeAll() {
    setOpen(false);
    setActiveConversation(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications and messages"
        className="fixed right-5 bottom-[calc(max(1.5rem,env(safe-area-inset-bottom))+4.25rem+var(--mobile-bottom-nav-space))] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-ember-line bg-surface text-ink shadow-xl transition-transform hover:scale-105 active:scale-95 max-md:static max-md:h-[30px] max-md:w-[30px] max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:shadow-none"
      >
        <Bell className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-sm font-bold text-bg">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={closeAll} />
          <div
            role="menu"
            aria-label="Inbox panel"
            className="fixed right-5 bottom-[calc(max(1.5rem,env(safe-area-inset-bottom))+7.75rem+var(--mobile-bottom-nav-space))] z-40 flex max-h-[70vh] w-full max-w-sm origin-bottom-right flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl animate-[panel-in_300ms_cubic-bezier(0.16,1,0.3,1)] max-md:top-[3.85rem] max-md:bottom-auto max-md:origin-top-right max-md:z-[51]"
          >
            {activeConversation ? (
              <InlineChat
                conversationId={activeConversation.id}
                currentUserId={currentUserId}
                fallbackName={activeConversation.otherUserName}
                fallbackAvatarUrl={activeConversation.otherUserAvatarUrl}
                onBack={() => setActiveConversation(null)}
                onClose={closeAll}
              />
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold uppercase tracking-wider text-ink-faint">Inbox</p>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/messages"
                      onClick={closeAll}
                      className="text-sm font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
                    >
                      View All
                    </Link>
                    {items.some((item) => item.kind === "notification" && !item.read) && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-sm font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
                      >
                        Mark All as Read
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-y-auto">
                  {items.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-ink-muted">Nothing here yet.</p>
                  ) : (
                    items.map((item) =>
                      item.kind === "notification" ? (
                        <NotificationRow key={`n-${item.id}`} item={item} onOpen={() => handleOpenNotification(item)} />
                      ) : (
                        <MessageRow key={`m-${item.id}`} item={item} onOpen={() => handleOpenMessage(item)} />
                      )
                    )
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

function NotificationRow({
  item,
  onOpen,
}: {
  item: Extract<InboxItem, { kind: "notification" }>;
  onOpen: () => void;
}) {
  const content = (
    <div className="flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-surface-2">
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full border",
          item.read ? "border-border text-ink-faint" : "border-ember-line text-ember"
        )}
        aria-hidden="true"
      >
        <Bell className="h-3.5 w-3.5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className={cn("text-sm", item.read ? "text-ink-muted" : "text-ink")}>{item.content}</p>
        <p className="mt-0.5 text-sm text-ink-faint">{formatRelativeDate(new Date(item.at))}</p>
      </div>
    </div>
  );

  if (item.link) {
    return (
      <Link href={item.link} onClick={onOpen}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onOpen} className="block w-full text-left">
      {content}
    </button>
  );
}

function MessageRow({ item, onOpen }: { item: Extract<InboxItem, { kind: "message" }>; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-surface-2"
    >
      <span className="relative shrink-0">
        <Avatar name={item.otherUserName} avatarUrl={item.otherUserAvatarUrl} />
        <span
          className="absolute -right-1 -bottom-1 grid h-4 w-4 place-items-center rounded-full border border-border bg-surface text-ember"
          aria-hidden="true"
        >
          <MessageSquare className="h-2.5 w-2.5" strokeWidth={2} />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={cn("truncate text-sm font-semibold", item.unreadCount > 0 ? "text-ink" : "text-ink")}>
            {item.otherUserName}
          </span>
          <span className="shrink-0 text-sm text-ink-faint">{formatRelativeDate(new Date(item.at))}</span>
        </span>
        <span className="mt-0.5 line-clamp-1 block text-sm text-ink-muted">
          {item.lastMessagePreview ?? "No messages yet"}
        </span>
      </span>
      {item.unreadCount > 0 && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-danger" />}
    </button>
  );
}
