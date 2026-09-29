"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { acceptGuidelines } from "@/lib/actions/guidelines";
import { ReadingTitle } from "@/components/ui/heading";
import { PANEL_ACCENT } from "@/components/ui/panel";

type GuidelinesAcceptanceProps = {
  isLoggedIn: boolean;
  initialAccepted: boolean;
};

/**
 * Checkbox di accettazione in fondo alla pagina Community Guidelines, uno dei tre requisiti per
 * poter pubblicare per la prima volta (vedi lib/creator.ts, getPublishReadiness). Resta
 * disabilitata finché il lettore non ha davvero scrollato fino a questo punto della pagina
 * (IntersectionObserver su un elemento sentinella appena sopra), non solo "presente sulla pagina".
 */
export function GuidelinesAcceptance({ isLoggedIn, initialAccepted }: GuidelinesAcceptanceProps) {
  const [accepted, setAccepted] = useState(initialAccepted);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (accepted) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setReachedEnd(true);
      },
      { threshold: 1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [accepted]);

  function handleChange() {
    if (accepted || !reachedEnd) return;
    setAccepted(true);
    startTransition(async () => {
      const result = await acceptGuidelines();
      if (result.error) setAccepted(false);
    });
  }

  return (
    <section className={PANEL_ACCENT}>
      <div ref={sentinelRef} aria-hidden="true" />
      <ReadingTitle>Accept These Guidelines</ReadingTitle>

      {!isLoggedIn ? (
        <p className="mt-2 text-sm leading-relaxed text-ink">
          Accepting these guidelines is required before you can publish on Zero.{" "}
          <Link href="/login" className="font-semibold text-ember hover:underline">
            Log in
          </Link>{" "}
          to accept them.
        </p>
      ) : (
        <label className="mt-3 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={accepted}
            disabled={accepted || !reachedEnd || isPending}
            onChange={handleChange}
            className="mt-0.5 h-4 w-4 shrink-0 accent-ember disabled:cursor-not-allowed"
          />
          <span className="text-sm leading-relaxed text-ink">
            {accepted
              ? "You've read and accepted these Community Guidelines."
              : reachedEnd
                ? "I have read and agree to these Community Guidelines."
                : "Keep scrolling to the end of this page to accept."}
          </span>
        </label>
      )}
    </section>
  );
}
