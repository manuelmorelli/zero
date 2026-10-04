"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setCreatorMode } from "@/lib/actions/creatorMode";
import { Switch } from "@/components/ui/switch";
import { ButtonDanger, ButtonSecondary } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CreatorModeSwitchProps = {
  creatorMode: boolean;
  journeyCount: number;
};

/** Interruttore Visitatore/Creator in Impostazioni. Spegnerlo con Journey attivi chiede conferma. */
export function CreatorModeSwitch({ creatorMode, journeyCount }: CreatorModeSwitchProps) {
  const [enabled, setEnabled] = useState(creatorMode);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function apply(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      try {
        await setCreatorMode(next);
        toast.success(next ? "Creator mode is on" : "Creator mode is off");
      } catch {
        setEnabled(!next);
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  function handleChange(next: boolean) {
    if (!next && journeyCount > 0) {
      setConfirmOpen(true);
      return;
    }
    apply(next);
  }

  const journeyLabel = `${journeyCount} Journey${journeyCount === 1 ? "" : "s"}`;

  return (
    <>
      <Switch
        label="Creator mode"
        description={
          enabled
            ? "You can publish Journeys and Updates. We send reminders if you stop publishing for a long time."
            : "You can watch, follow and like. Turn this on to publish."
        }
        checked={enabled}
        onChange={handleChange}
        className={pending ? "opacity-70" : undefined}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Turn off Creator mode?</DialogTitle>
            <DialogDescription>
              Your {journeyLabel} will be hidden from Zero now and permanently deleted in 30 days. Turn
              Creator mode back on within those 30 days to restore them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <ButtonSecondary onClick={() => setConfirmOpen(false)}>Keep Creator mode</ButtonSecondary>
            <ButtonDanger
              onClick={() => {
                setConfirmOpen(false);
                apply(false);
              }}
            >
              Turn off and hide Journeys
            </ButtonDanger>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
