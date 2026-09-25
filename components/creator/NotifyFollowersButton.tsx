"use client";

import { useState, useTransition } from "react";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";
import { notifyFollowersOfListingAction } from "@/lib/actions/communityListing";
import type { CommunityListingType } from "@/lib/constants/communityListing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Mai automatico: compare solo sugli elementi già pubblicati, e richiede sempre questa conferma
 * esplicita prima di avvisare davvero i follower (regola di sicurezza concordata con Manuel,
 * Punto 8 dell'allineamento). */
export function NotifyFollowersButton({
  listingId,
  listingType,
  title,
}: {
  listingId: string;
  listingType: CommunityListingType;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("listingId", listingId);
      formData.set("listingType", listingType);
      const result = await notifyFollowersOfListingAction({ error: null }, formData);

      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Your followers have been notified.");
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-ember/30 px-3.5 py-1.5 text-xs font-semibold text-ember transition-colors hover:bg-ember/10"
      >
        <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
        Notify your followers
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Notify your followers?</DialogTitle>
            <DialogDescription>
              {`Every follower who hasn't turned this off will get a notification about "${title}". This can't be undone.`}
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-danger">{error}</p>}
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
              onClick={handleConfirm}
              disabled={pending}
              className="rounded-full bg-ember px-4 py-2 text-[0.8rem] font-semibold text-white transition-colors hover:bg-ember/90 disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send notification"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
