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
import { Button, ButtonSecondary } from "@/components/ui/button";

/** "New chat" della chat AI Community, con la matita come su Gemini. Chiede conferma perché non
 * esiste uno storico: la conversazione cancellata non si recupera (quello già creato resta). */
export function CommunityAiNewChatButton({ onConfirm, disabled }: { onConfirm: () => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ButtonSecondary onClick={() => setOpen(true)} disabled={disabled} className="py-2">
        <SquarePen className="h-4 w-4" aria-hidden="true" />
        New chat
      </ButtonSecondary>

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
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setOpen(false);
                  onConfirm();
                }}
              >
                New chat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
