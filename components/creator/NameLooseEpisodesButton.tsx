"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import { createChapterFromLooseEpisodes } from "@/lib/actions/chapter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function NameLooseEpisodesButton({ journeyId }: { journeyId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createChapterFromLooseEpisodes, { error: null });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[0.72rem] text-ink-muted transition-colors hover:text-ember"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Give this a title
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Turn into a chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-5 pt-4">
            <p className="text-sm text-ink-muted">
              These episodes aren&apos;t in a chapter yet. Give this group a title to turn it into a real chapter.
            </p>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="journeyId" value={journeyId} />
              <input
                type="text"
                name="title"
                required
                minLength={2}
                maxLength={100}
                placeholder="Chapter title"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
              />
              {state.error && <p className="text-sm text-danger">{state.error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
              >
                {pending ? "Saving…" : "Create chapter"}
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
