"use client";

import { useState } from "react";
import { SquarePen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** "New chat" della chat AI Community, con la matita come su Gemini. Chiede conferma perché non
 * esiste uno storico: la conversazione cancellata non si recupera (quello già creato resta). */
export function CommunityAiNewChatButton({ onConfirm, disabled }: { onConfirm: () => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-full border border-ember/35 bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-[0_0_20px_-10px_rgba(226,145,77,45%)] transition-all duration-300 hover:border-ember/70 hover:shadow-[0_0_28px_-8px_rgba(226,145,77,70%)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SquarePen className="h-4 w-4" aria-hidden="true" />
        New chat
      </button>

      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Start a new chat?</DialogTitle>
              <DialogDescription>
                This conversation will be deleted. Anything you already created in your Community stays.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border px-4 py-2 text-[0.8rem] font-semibold text-ink-muted transition-colors hover:border-ember-line"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onConfirm();
                }}
                className="rounded-full bg-danger px-4 py-2 text-[0.8rem] font-semibold text-white transition-colors hover:bg-danger/90"
              >
                New chat
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
