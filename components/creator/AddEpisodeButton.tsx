"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EpisodeForm } from "@/components/creator/EpisodeForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AddEpisodeButton({
  journeyId,
  chapters,
  defaultChapterId,
  label = "Add Episode",
}: {
  journeyId: string;
  chapters: { id: string; title: string }[];
  defaultChapterId?: string | null;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3.5 py-1.5 text-[0.78rem] text-ink-muted transition-colors hover:border-ember/60 hover:text-ember"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add episode</DialogTitle>
          </DialogHeader>
          <div className="p-5 pt-4">
            <EpisodeForm journeyId={journeyId} chapters={chapters} defaultChapterId={defaultChapterId} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
