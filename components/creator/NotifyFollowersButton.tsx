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
import { Button } from "@/components/ui/button";

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
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
        Notify your followers
      </Button>

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
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={pending}>
              {pending ? "Sending…" : "Send notification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
