"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { toggleBlock } from "@/lib/actions/block";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** Blocca un utente dal suo profilo (components/common/ReportButton.tsx, stesso punto
 * d'ingresso). Sbloccare si fa invece da Settings > Privacy (components/settings/BlockedUsersList.tsx),
 * non da qui: una volta bloccato il profilo non è più raggiungibile per rivedere questo pulsante. */
export function BlockButton({ userId, name }: { userId: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    const result = await toggleBlock(userId);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setOpen(false);
    toast.success(`${name} has been blocked.`);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Block"
        className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-muted transition-colors hover:border-danger hover:text-danger"
      >
        <Ban className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
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
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={pending} onClick={handleConfirm}>
              {pending ? "Blocking…" : "Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
