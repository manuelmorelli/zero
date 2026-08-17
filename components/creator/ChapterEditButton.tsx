"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteChapter } from "@/lib/actions/chapter";
import { ChapterForm } from "@/components/creator/ChapterForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ChapterEditButton({
  journeyId,
  chapter,
}: {
  journeyId: string;
  chapter: { id: string; title: string; description: string | null };
}) {
  const [open, setOpen] = useState(false);

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
            <form action={deleteChapter} className="border-t border-border pt-4">
              <input type="hidden" name="chapterId" value={chapter.id} />
              <button type="submit" className="inline-flex items-center gap-1.5 text-xs font-medium text-danger hover:opacity-80">
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete chapter
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
