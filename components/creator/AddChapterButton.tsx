"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ChapterForm } from "@/components/creator/ChapterForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AddChapterButton({ journeyId, label = "Add Chapter" }: { journeyId: string; label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[0.78rem] font-semibold text-ink transition-colors hover:border-ink-muted"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New chapter</DialogTitle>
          </DialogHeader>
          <div className="p-5 pt-4">
            <ChapterForm journeyId={journeyId} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
