"use client";

import { useState } from "react";
import Link from "next/link";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notification";
import { formatRelativeDate } from "@/lib/utils";

type NotificationItem = {
  id: string;
  content: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

type NotificationBellButtonProps = {
  unreadCount: number;
  notifications: NotificationItem[];
};

export function NotificationBellButton({ unreadCount, notifications }: NotificationBellButtonProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const [unread, setUnread] = useState(unreadCount);

  function handleMarkAllRead() {
    if (unread === 0) return;
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnread(0);
    markAllNotificationsRead();
  }

  function handleOpenNotification(item: NotificationItem) {
    if (!item.read) {
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
      setUnread((count) => Math.max(0, count - 1));
      markNotificationRead(item.id);
    }
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        // In pila sopra il pulsante "+" globale (bottom: max(1.5rem, safe-area) + 3.5rem di
        // altezza + gap): il sito non ha un header comune a tutte le pagine, e la Home ha un
        // proprio header (SiteHeader) che occupa già l'angolo in alto a destra — l'angolo in
        // basso a destra, già usato dal "+", è l'unico punto libero su ogni pagina.
        style={{ bottom: "calc(max(1.5rem, env(safe-area-inset-bottom)) + 4.25rem)" }}
        className="fixed right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-xl shadow-black/40 transition-transform hover:scale-105 active:scale-95"
      >
        <BellIcon className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-bg">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            role="menu"
            aria-label="Notifications panel"
            style={{ bottom: "calc(max(1.5rem, env(safe-area-inset-bottom)) + 7.75rem)" }}
            className="fixed right-5 z-40 flex max-h-[70vh] w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/40"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-muted">No notifications yet.</p>
              ) : (
                items.map((item) => (
                  <NotificationRow key={item.id} item={item} onOpen={() => handleOpenNotification(item)} />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function NotificationRow({ item, onOpen }: { item: NotificationItem; onOpen: () => void }) {
  const content = (
    <div className="flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-surface-2">
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-transparent" : "bg-danger"}`}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className={`text-sm ${item.read ? "text-ink-muted" : "text-ink"}`}>{item.content}</p>
        <p className="mt-0.5 text-xs text-ink-faint">{formatRelativeDate(new Date(item.createdAt))}</p>
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

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} className={className} aria-hidden="true">
      <path
        d="M5 8a5 5 0 0 1 10 0c0 3.5 1 4.5 1 5.5H4c0-1 1-2 1-5.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.5 16a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
    </svg>
  );
}
