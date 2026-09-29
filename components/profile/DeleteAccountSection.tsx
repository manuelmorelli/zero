"use client";

import { useState, useTransition } from "react";
import { requestAccountDeletionAction } from "@/lib/actions/account";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CHIP } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

type DeleteAccountSectionProps = {
  /** Bare button, no border/padding wrapper — used inline next to Save in EditProfileButton. */
  inline?: boolean;
};

/** Avvia la cancellazione dell'account dietro conferma esplicita, come deciso con Manuel
 * (docs/91_Legal_Audit_And_Roadmap.md). Usato in fondo a Settings/Account e, in forma inline,
 * accanto al bottone Save di Edit Profile (components/profile/EditProfileButton.tsx). */
export function DeleteAccountSection({ inline = false }: DeleteAccountSectionProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(() => {
      requestAccountDeletionAction();
    });
  }

  return (
    <div className={inline ? "" : "border-t border-border px-5 py-4"}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={inline ? cn(CHIP, "text-danger hover:border-danger") : "text-sm font-medium text-danger hover:underline"}
      >
        Delete My Account
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm p-0">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 px-4 py-4 text-sm text-ink-muted">
            <p>
              Your Journeys, Episodes, Updates, conversations and photos will be permanently deleted 10
              days from now.
            </p>
            <p>You can cancel by logging back in any time before then.</p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={pending} onClick={handleConfirm}>
              {pending ? "Deleting…" : "Yes, delete my account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
