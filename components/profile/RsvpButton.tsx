"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { toggleWorkshopRsvp, toggleEventRsvp } from "@/lib/actions/rsvp";

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
      <Link
        href="/login"
        className="shrink-0 whitespace-nowrap rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-ink-muted"
      >
        Log in
      </Link>
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
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        going ? "border border-ember/40 text-ember" : "bg-ember text-white hover:bg-ember/90"
      }`}
    >
      {going ? "I'm going ✓" : "I'm going"}
    </button>
  );
}
