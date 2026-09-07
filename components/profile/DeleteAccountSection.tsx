"use client";

import { useState, useTransition } from "react";
import { requestAccountDeletionAction } from "@/lib/actions/account";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
        className={
          inline
            ? "rounded-full border border-border px-4 py-2 text-sm font-medium text-danger transition-colors hover:border-danger"
            : "text-sm font-medium text-danger hover:underline"
        }
      >
        Delete my account
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
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleConfirm}
              className="rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Deleting…" : "Yes, delete my account"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
