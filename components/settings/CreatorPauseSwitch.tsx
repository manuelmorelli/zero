"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setCreatorPause } from "@/lib/actions/creatorMode";
import { Switch } from "@/components/ui/switch";

type CreatorPauseSwitchProps = {
  paused: boolean;
};

/** Pausa del creator: finché è attiva non partono avvisi per i primi 10 mesi. I Journey restano online. */
export function CreatorPauseSwitch({ paused }: CreatorPauseSwitchProps) {
  const [enabled, setEnabled] = useState(paused);
  const [pending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      try {
        await setCreatorPause(next);
        toast.success(next ? "Break started" : "Welcome back");
      } catch {
        setEnabled(!next);
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Switch
      label="Take a break"
      description={
        enabled
          ? "Your Journeys stay online. We will not send reminders until you come back, for up to 10 months."
          : "Pause if you are between Journeys. Your Journeys stay online and no reminders are sent for up to 10 months."
      }
      checked={enabled}
      onChange={handleChange}
      className={pending ? "opacity-70" : undefined}
    />
  );
}
