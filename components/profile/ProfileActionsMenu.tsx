"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Flag, Link as LinkIcon, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { createReport } from "@/lib/actions/report";
import { REPORT_REASONS } from "@/components/common/ReportButton";
import { toggleBlock } from "@/lib/actions/block";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CHIP, CHIP_SELECTED } from "@/components/ui/panel";
import { FIELD } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Menu "..." sul profilo altrui (stile Instagram): raccoglie le azioni secondarie — Segnala,
 * Blocca, Copia link — al posto delle icone separate che c'erano prima (ReportButton.tsx +
 * BlockButton.tsx). "Smetti di seguire" resta fuori di proposito: vive già nel tasto
 * Follow/Following stesso, un click solo, nessun menu — qui ci sono solo le azioni che devono
 * restare raggiungibili anche senza seguire la persona. */
export function ProfileActionsMenu({ userId, name }: { userId: string; name: string }) {
  const router = useRouter();
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>(REPORT_REASONS[0]);
  const [detail, setDetail] = useState("");
  const [reportPending, setReportPending] = useState(false);
  const [blockPending, setBlockPending] = useState(false);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  async function handleReportSubmit() {
    setReportPending(true);
    const result = await createReport({
      targetType: "USER",
      targetId: userId,
      reason,
      detail: detail || undefined,
    });
    setReportPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Thanks, we've received your report.");
    setReportOpen(false);
    setDetail("");
    setReason(REPORT_REASONS[0]);
  }

  async function handleBlockConfirm() {
    setBlockPending(true);
    const result = await toggleBlock(userId);
    setBlockPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setBlockOpen(false);
    toast.success(`${name} has been blocked.`);
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="More options"
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-muted transition-colors hover:border-ember hover:text-ember"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={handleCopyLink}>
            <LinkIcon className="h-4 w-4" aria-hidden="true" />
            Copy profile link
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setReportOpen(true)}>
            <Flag className="h-4 w-4" aria-hidden="true" />
            Report
          </DropdownMenuItem>
          <DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => setBlockOpen(true)}>
            <Ban className="h-4 w-4" aria-hidden="true" />
            Block
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
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
            <Button variant="secondary" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={reportPending} onClick={handleReportSubmit}>
              {reportPending ? "Sending…" : "Send report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{`Block ${name}?`}</DialogTitle>
          </DialogHeader>
          <div className="px-5 pb-1 text-sm text-ink-muted">
            You&apos;ll stop following each other and won&apos;t be able to message each other.
            Neither of you will be able to see the other&apos;s profile. You can unblock anytime
            from Settings &gt; Privacy.
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setBlockOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={blockPending} onClick={handleBlockConfirm}>
              {blockPending ? "Blocking…" : "Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
