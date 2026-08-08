"use client";

import { useState } from "react";
import { DEMO_MESSAGES } from "@/lib/demo/demoProfile";

type MessageButtonProps = {
  name: string;
};

/**
 * Solo l'aspetto di una casella messaggi: nessuna Messaggistica privata nell'MVP
 * (esplicitamente esclusa in 12_MVP_Features.md). Dati di conversazione finti, nessun invio reale.
 */
export function MessageButton({ name }: MessageButtonProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(DEMO_MESSAGES[0]?.id);
  const activeMessage = DEMO_MESSAGES.find((message) => message.id === activeId) ?? DEMO_MESSAGES[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink-muted"
      >
        Message
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setOpen(false)}>
          <div
            className="flex h-[520px] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-2/5 shrink-0 overflow-y-auto border-r border-border">
              <div className="border-b border-border px-4 py-3.5">
                <h2 className="text-sm font-bold text-ink">Messages</h2>
              </div>
              {DEMO_MESSAGES.map((message) => (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => setActiveId(message.id)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                    message.id === activeMessage?.id ? "bg-surface-2" : "hover:bg-surface-2/60"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink-muted">
                    {message.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-ink">{message.name}</span>
                      <span className="shrink-0 text-[11px] text-ink-faint">{message.time}</span>
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{message.preview}</span>
                  </span>
                  {message.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ember" />}
                </button>
              ))}
            </div>

            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink-muted">
                    {activeMessage?.initials}
                  </span>
                  <span className="text-sm font-semibold text-ink">{activeMessage?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-surface-2 px-3.5 py-2.5 text-sm text-ink">
                  {activeMessage?.preview}
                </div>
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-ink px-3.5 py-2.5 text-sm text-bg">
                  Thanks so much, really means a lot!
                </div>
              </div>

              <div className="border-t border-border p-3">
                <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2.5 text-sm text-ink-faint">
                  Message {name}…
                </div>
                <p className="mt-2 text-center text-[11px] text-ink-faint">Preview only — direct messages are coming soon.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
    </svg>
  );
}
