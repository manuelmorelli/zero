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
import { Button } from "@/components/ui/button";

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
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ember"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Edit
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-5 pt-4">
            <ChapterForm journeyId={journeyId} chapter={chapter} />
            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-danger hover:opacity-80"
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
              <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Delete
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
