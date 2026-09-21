"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { createReport } from "@/lib/actions/report";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ReportTargetType } from "@/generated/prisma/client";

const REPORT_REASONS = ["Spam", "Inappropriate content", "Copyright violation", "Harassment", "Other"] as const;

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
            <DialogTitle>Report content</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 px-5 pb-1">
            <div className="flex flex-wrap gap-1.5">
              {REPORT_REASONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setReason(option)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    reason === option
                      ? "border-ink bg-ink text-bg"
                      : "border-border bg-surface-2 text-ink hover:border-ink-muted"
                  }`}
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
              className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-border px-4 py-2 text-[0.8rem] font-semibold text-ink-muted transition-colors hover:border-ink-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleSubmit}
              className="rounded-full bg-danger px-4 py-2 text-[0.8rem] font-semibold text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send report"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
