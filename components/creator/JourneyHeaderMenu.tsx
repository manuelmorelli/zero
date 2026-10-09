"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Undo2, Archive } from "lucide-react";
import { archiveJourney, unpublishJourney } from "@/lib/actions/journey";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type JourneyHeaderMenuProps = {
  journeyId: string;
  status: string;
};

/** Azioni secondarie/delicate della pagina di gestione Journey ("Move to Draft", "Archive"): vivono
 * dentro un menu "···" invece che come bottoni sempre visibili, per non competere visivamente con
 * "View public page" (l'azione primaria, vedi app/dashboard/journeys/[id]/page.tsx). */
export function JourneyHeaderMenu({ journeyId, status }: JourneyHeaderMenuProps) {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const canMoveToDraft = status === "PUBLISHED" || status === "DISCOVERY";
  const canArchive = status !== "ARCHIVED";

  if (!canMoveToDraft && !canArchive) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="More actions"
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-muted transition-colors hover:border-ember-line hover:text-ember"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {canMoveToDraft && <MoveToDraftItem journeyId={journeyId} />}
          {canArchive && (
            <DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => setArchiveOpen(true)}>
              <Archive className="h-4 w-4" aria-hidden="true" />
              Archive Journey
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {archiveOpen && (
        <ArchiveJourneyDialog journeyId={journeyId} open={archiveOpen} onOpenChange={setArchiveOpen} />
      )}
    </>
  );
}

function MoveToDraftItem({ journeyId }: { journeyId: string }) {
  const [, formAction, pending] = useActionState(unpublishJourney, { error: null });

  return (
    <DropdownMenuItem
      disabled={pending}
      onSelect={() => {
        const formData = new FormData();
        formData.set("journeyId", journeyId);
        formAction(formData);
      }}
    >
      <Undo2 className="h-4 w-4" aria-hidden="true" />
      {pending ? "Moving to Draft…" : "Move to Draft"}
    </DropdownMenuItem>
  );
}

function ArchiveJourneyDialog({
  journeyId,
  open,
  onOpenChange,
}: {
  journeyId: string;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(archiveJourney, { error: null });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted && !pending && !state.error) {
      router.refresh();
      onOpenChange(false);
    }
  }, [submitted, pending, state.error, router, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Archive Journey</DialogTitle>
          <DialogDescription>
            It will stop being your active Journey, but stays visible on your public profile. It
            can&apos;t be deleted or unarchived. You&apos;ll be able to start a new Journey right away.
          </DialogDescription>
        </DialogHeader>
        <form
          action={(formData) => {
            setSubmitted(true);
            formAction(formData);
          }}
        >
          <input type="hidden" name="journeyId" value={journeyId} />
          {state.error && <p className="px-5 text-sm text-danger">{state.error}</p>}
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" disabled={pending}>
              {pending ? "Archiving…" : "Archive"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
