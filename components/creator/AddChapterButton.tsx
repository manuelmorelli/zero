"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ChapterForm } from "@/components/creator/ChapterForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AddChapterButton({ journeyId, label = "Add Chapter" }: { journeyId: string; label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Chapter</DialogTitle>
          </DialogHeader>
          <div className="p-5 pt-4">
            <ChapterForm journeyId={journeyId} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
