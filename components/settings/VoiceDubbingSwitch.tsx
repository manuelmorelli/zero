"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setVoiceDubbingConsent } from "@/lib/actions/creatorMode";
import { Switch } from "@/components/ui/switch";

type VoiceDubbingSwitchProps = {
  allowed: boolean;
};

/** Consenso al doppiaggio futuro della voce del creator in altre lingue. Solo il permesso: la funzione non esiste ancora. */
export function VoiceDubbingSwitch({ allowed }: VoiceDubbingSwitchProps) {
  const [enabled, setEnabled] = useState(allowed);
  const [pending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      try {
        await setVoiceDubbingConsent(next);
        toast.success(next ? "Consent given" : "Consent withdrawn");
      } catch {
        setEnabled(!next);
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Switch
      label="Voice dubbing"
      description="Authorize Zero to use my voice to translate my episodes into other languages, when this feature becomes available."
      checked={enabled}
      onChange={handleChange}
      className={pending ? "opacity-70" : undefined}
    />
  );
}
