"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteChapter } from "@/lib/actions/chapter";
import { ChapterForm } from "@/components/creator/ChapterForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ChapterEditButton({
  journeyId,
  chapter,
  episodeCount,
}: {
  journeyId: string;
  chapter: { id: string; title: string; description: string | null };
  /** Per far vedere subito, nell'avviso di conferma, quanti Episodi spariranno insieme al Capitolo. */
  episodeCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[0.72rem] text-ink-muted transition-colors hover:text-ember"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Edit
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-5 pt-4">
            <ChapterForm journeyId={journeyId} chapter={chapter} />
            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-danger hover:opacity-80"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete chapter
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Chapter</DialogTitle>
            <DialogDescription>
              {episodeCount > 0
                ? `"${chapter.title}" and its ${episodeCount} episode${episodeCount === 1 ? "" : "s"} (videos included) will be deleted for good. This can't be undone.`
                : `"${chapter.title}" will be deleted for good. This can't be undone.`}
            </DialogDescription>
          </DialogHeader>
          <form action={deleteChapter}>
            <input type="hidden" name="chapterId" value={chapter.id} />
            <DialogFooter>
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
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
    </>
  );
}
