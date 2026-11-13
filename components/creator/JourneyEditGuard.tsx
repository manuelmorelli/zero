"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type GuardContextValue = { dirty: boolean; setDirty: (next: boolean) => void };

const GuardContext = createContext<GuardContextValue>({ dirty: false, setDirty: () => {} });

/** Fa sapere al pulsante di uscita se il modulo del Journey ha modifiche non salvate: avvolge
 * il riquadro "Journey details" (modulo e pulsante di uscita sono fratelli, non genitore/figlio). */
export function JourneyEditGuard({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false);
  return <GuardContext.Provider value={{ dirty, setDirty }}>{children}</GuardContext.Provider>;
}

/** Chiamato dal modulo a ogni cambio: pubblica lo stato "modificato / non modificato". */
export function useReportDirty(dirty: boolean) {
  const { setDirty } = useContext(GuardContext);
  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty, setDirty]);
}

/** X di uscita rapida: se ci sono modifiche non salvate chiede conferma prima di andare via. */
export function JourneyExitButton({ href }: { href: string }) {
  const router = useRouter();
  const { dirty } = useContext(GuardContext);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        onClick={() => (dirty ? setConfirmOpen(true) : router.push(href))}
        className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-muted hover:text-ink"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              You have changes that haven&apos;t been saved. If you leave now, they will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Keep editing
            </Button>
            <Button variant="danger" onClick={() => router.push(href)}>
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
