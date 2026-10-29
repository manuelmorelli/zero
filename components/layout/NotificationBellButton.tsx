"use client";

import { useState } from "react";
import Link from "next/link";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notification";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { cn, formatRelativeDate } from "@/lib/utils";

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
  // Sotto i 768px questo bottone vive fuori dall'header (vedi className più sotto), quindi non
  // sparisce da solo insieme a lui scorrendo: senza questo finisce fisso sopra le card una volta
  // che l'header è già scomparso.
  const hiddenOnScroll = useHideOnScroll();

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
        // Sotto i 768px: dentro l'header invece, accanto a Ember. Fluttuare in basso a destra
        // lì metteva il pulsante sopra a contenuti veri (liste, form), intercettando il tocco
        // al posto loro (trovato su Settings e sulla creazione di un nuovo Journey).
        className={cn(
          "fixed right-5 bottom-[calc(max(1.5rem,env(safe-area-inset-bottom))+4.25rem+var(--mobile-bottom-nav-space))] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-ember-line bg-surface text-ink shadow-xl transition-transform hover:scale-105 active:scale-95 max-md:right-16 max-md:top-[0.65rem] max-md:bottom-auto max-md:z-[51] max-md:h-5 max-md:w-5 max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:shadow-none",
          hiddenOnScroll && "max-md:-translate-y-16"
        )}
      >
        <BellIcon className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-sm font-bold text-bg">
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
            className="fixed right-5 bottom-[calc(max(1.5rem,env(safe-area-inset-bottom))+7.75rem+var(--mobile-bottom-nav-space))] z-40 flex max-h-[70vh] w-full max-w-sm origin-bottom-right flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl animate-[panel-in_300ms_cubic-bezier(0.16,1,0.3,1)] max-md:top-[3.85rem] max-md:bottom-auto max-md:origin-top-right max-md:z-[51]"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-ink-faint">Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-sm font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
                >
                  Mark All as Read
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
        <p className="mt-0.5 text-sm text-ink-faint">{formatRelativeDate(new Date(item.createdAt))}</p>
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
