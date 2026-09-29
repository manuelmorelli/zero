"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import { createChapterFromLooseEpisodes } from "@/lib/actions/chapter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FIELD } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NameLooseEpisodesButton({ journeyId }: { journeyId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createChapterFromLooseEpisodes, { error: null });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ember"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Give this a title
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Turn Into a Chapter</DialogTitle>
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
                className={FIELD}
              />
              {state.error && <p className="text-sm text-danger">{state.error}</p>}
              <Button variant="primary" type="submit" disabled={pending}>
                {pending ? "Saving…" : "Create chapter"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
