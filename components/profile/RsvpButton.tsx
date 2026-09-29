"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { toggleWorkshopRsvp, toggleEventRsvp } from "@/lib/actions/rsvp";
import { Button } from "@/components/ui/button";

type RsvpButtonProps = {
  kind: "workshop" | "event";
  id: string;
  initialGoing: boolean;
  isLoggedIn: boolean;
};

/** Pulsante "Partecipo" reale (Punto 8 dell'allineamento, 2026-09-25): solo sugli eventi/workshop
 * gratuiti, funziona subito perché non è un pagamento — a differenza di Buy/Reserve, mai
 * disattivato con "Coming soon". */
export function RsvpButton({ kind, id, initialGoing, isLoggedIn }: RsvpButtonProps) {
  const [going, setGoing] = useState(initialGoing);
  const [pending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Button variant="secondary" href="/login" className="shrink-0">
        Log in
      </Button>
    );
  }

  function handleClick() {
    startTransition(async () => {
      const result = kind === "workshop" ? await toggleWorkshopRsvp(id) : await toggleEventRsvp(id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setGoing(result.going);
    });
  }

  return (
    <Button variant="secondary" onClick={handleClick} disabled={pending} className="shrink-0 whitespace-nowrap">
      {going ? "I'm Going ✓" : "I'm Going"}
    </Button>
  );
}
