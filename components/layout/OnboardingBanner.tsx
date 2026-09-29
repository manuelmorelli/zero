"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PAGE_WIDTH } from "@/components/ui/page-container";
import { cn } from "@/lib/utils";

type OnboardingBannerProps = {
  userId: string;
};

function dismissKey(userId: string) {
  return `onboarding-banner-dismissed:${userId}`;
}

/**
 * Invito non invasivo a completare l'Onboarding, mostrato al posto del vecchio redirect
 * forzato dalla Home (vedi 00-project-context.md, sezione "Onboarding"): resta dismissibile,
 * ma solo per la sessione del browser corrente (sessionStorage, non localStorage) — riappare
 * al prossimo login finché l'utente non ha davvero scelto almeno un interesse (il chiamante
 * lo renderizza solo quando needsOnboarding è vero, vedi app/(site)/page.tsx), invece di
 * sparire per sempre dopo una sola chiusura.
 */
export function OnboardingBanner({ userId }: OnboardingBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(window.sessionStorage.getItem(dismissKey(userId)) !== "1");
  }, [userId]);

  if (!visible) return null;

  function dismiss() {
    window.sessionStorage.setItem(dismissKey(userId), "1");
    setVisible(false);
  }

  return (
    <div className="relative z-40 border-b border-border bg-surface">
      <div className={cn(PAGE_WIDTH.wide, "flex items-center justify-between gap-4 pb-3 pt-20 text-sm")}>
        <p className="text-ink-muted">
          Tell us what you&apos;re into for better recommendations.{" "}
          <Link href="/onboarding" className="font-semibold text-ink underline underline-offset-2">
            Pick Your Interests
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 text-ink-muted transition-colors hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
