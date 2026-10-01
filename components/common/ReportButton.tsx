"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { createReport } from "@/lib/actions/report";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CHIP, CHIP_SELECTED } from "@/components/ui/panel";
import type { ReportTargetType } from "@/generated/prisma/client";
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const REPORT_REASONS = ["Spam", "Inappropriate content", "Copyright violation", "Harassment", "Other"] as const;

type ReportButtonProps = {
  targetType: ReportTargetType;
  targetId: string;
  className?: string;
};

/** Segnala Journey o profili (non gli Update, decisione esplicita di Manuel: sono contenuti
 * effimeri che spariscono da soli entro 24h). Scrive nel modello Report già esistente
 * (prisma/schema.prisma) — nessun pannello di gestione, vedi lib/actions/report.ts. */
export function ReportButton({ targetType, targetId, className }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>(REPORT_REASONS[0]);
  const [detail, setDetail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setPending(true);
    const result = await createReport({ targetType, targetId, reason, detail: detail || undefined });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Thanks, we've received your report.");
    setOpen(false);
    setDetail("");
    setReason(REPORT_REASONS[0]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Report"
        className={
          className ??
          "grid h-9 w-9 place-items-center rounded-full border border-border text-ink-muted transition-colors hover:border-danger hover:text-danger"
        }
      >
        <Flag className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 px-5 pb-1">
            <div className="flex flex-wrap gap-1.5">
              {REPORT_REASONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setReason(option)}
                  className={reason === option ? CHIP_SELECTED : CHIP}
                >
                  {option}
                </button>
              ))}
            </div>
            <textarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Add details (optional)"
              className={cn(FIELD, "resize-none")}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={pending} onClick={handleSubmit}>
              {pending ? "Sending…" : "Send report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
