"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OnboardingBannerProps = {
  userId: string;
};

function dismissKey(userId: string) {
  return `onboarding-banner-dismissed:${userId}`;
}

/**
 * Invito non invasivo a completare l'Onboarding, mostrato al posto del vecchio redirect
 * forzato dalla Home (vedi 00-project-context.md, sezione "Onboarding"): resta dismissibile
 * e ricordato per utente via localStorage, non riappare più dopo la chiusura.
 */
export function OnboardingBanner({ userId }: OnboardingBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(dismissKey(userId)) !== "1");
  }, [userId]);

  if (!visible) return null;

  function dismiss() {
    window.localStorage.setItem(dismissKey(userId), "1");
    setVisible(false);
  }

  return (
    <div className="relative z-40 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-sm">
        <p className="text-ink-muted">
          Tell us what you&apos;re into for better recommendations.{" "}
          <Link href="/onboarding" className="font-semibold text-ink underline underline-offset-2">
            Pick your interests
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
