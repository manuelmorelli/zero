"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArrowLeft, ArrowRight, MoreHorizontal, Pencil, Send, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { archiveJourney, deleteJourney, moveJourney } from "@/lib/actions/journey";
import { shareToUpdate } from "@/lib/actions/update";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

type JourneyCardMenuProps = {
  journeyId: string;
  title: string;
  /** Archiviare un Journey già archiviato non è permesso (vedi lib/actions/journey.ts): la voce
   * resta nascosta invece di mostrare un'azione che fallirebbe sempre. */
  alreadyArchived: boolean;
  /** Posizione nell'elenco completo dei Journey del profilo (non nella vista/anteprima corrente):
   * disabilitano "Move Back"/"Move Forward" quando il Journey è già il primo o l'ultimo. */
  canMoveBack: boolean;
  canMoveForward: boolean;
};

/**
 * Menu reale sulle card dei Journey (non sugli episodi, che hanno solo "Condividi"): qui ci sono
 * davvero tre azioni distinte e utili, per questo un DropdownMenu ha senso. "Edit" porta alla
 * Dashboard (dove vive già il vero form di modifica, con caption/video/capitoli — replicarlo qui
 * in piccolo avrebbe significato duplicare quella logica). "Archive" chiama l'azione reale già
 * usata in Dashboard (un Journey non si cancella mai, solo si archivia).
 */
export function JourneyCardMenu({
  journeyId,
  title,
  alreadyArchived,
  canMoveBack,
  canMoveForward,
}: JourneyCardMenuProps) {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/journeys/${journeyId}`);
      toast.success("Link copied", { description: title });
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  async function handleAddToUpdate() {
    const result = await shareToUpdate({ linkedJourneyId: journeyId, content: `New Journey: ${title}` });
    if (result.error) toast.error(result.error);
    else toast.success("Added to your Update");
  }

  async function handleMove(direction: "up" | "down") {
    try {
      await moveJourney(journeyId, direction);
      router.refresh();
    } catch {
      toast.error("Couldn't reorder the Journey");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Manage ${title}`}
          className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-bg/50 text-ink backdrop-blur-md transition-colors hover:bg-bg/80"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/journeys/${journeyId}`}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canMoveBack} onSelect={() => handleMove("up")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Move Back
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canMoveForward} onSelect={() => handleMove("down")}>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            Move Forward
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleShare}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleAddToUpdate}>
            <Send className="h-4 w-4" aria-hidden="true" />
            Add to your Update
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {!alreadyArchived && (
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onSelect={() => setArchiveOpen(true)}
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
              Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-danger focus:text-danger"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {archiveOpen && (
        <ArchiveJourneyDialog
          journeyId={journeyId}
          title={title}
          open={archiveOpen}
          onOpenChange={setArchiveOpen}
        />
      )}
      {deleteOpen && (
        <DeleteJourneyDialog
          journeyId={journeyId}
          title={title}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}
    </>
  );
}

function ArchiveJourneyDialog({
  journeyId,
  title,
  open,
  onOpenChange,
}: {
  journeyId: string;
  title: string;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(archiveJourney, { error: null });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted && !pending && !state.error) {
      toast.success("Journey archived", { description: title });
      router.refresh();
      onOpenChange(false);
    }
  }, [submitted, pending, state.error, title, router, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Archive Journey</DialogTitle>
          <DialogDescription>
            {`"${title}" will move out of active management, but stays visible on your public profile. This can't be undone.`}
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
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border px-4 py-2 text-[0.8rem] font-semibold text-ink-muted transition-colors hover:border-ink-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-danger px-4 py-2 text-[0.8rem] font-semibold text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
            >
              {pending ? "Archiving…" : "Archive"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteJourneyDialog({
  journeyId,
  title,
  open,
  onOpenChange,
}: {
  journeyId: string;
  title: string;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Journey</DialogTitle>
          <DialogDescription>
            {`"${title}" will be deleted for good, including its Chapters and Episodes — it will also disappear from your public profile. This can't be undone.`}
          </DialogDescription>
        </DialogHeader>
        <form action={deleteJourney}>
          <input type="hidden" name="journeyId" value={journeyId} />
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border px-4 py-2 text-[0.8rem] font-semibold text-ink-muted transition-colors hover:border-ink-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-danger px-4 py-2 text-[0.8rem] font-semibold text-white transition-colors hover:bg-danger/90"
            >
              Delete
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
