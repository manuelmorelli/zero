"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddEpisodeCard } from "@/components/creator/AddEpisodeCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Episode</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <AddEpisodeCard journeyId={journeyId} chapters={chapters} defaultChapterId={defaultChapterId} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
