"use client";

import { useEffect, useState } from "react";

type WelcomeBannerProps = {
  userId: string;
  name: string;
};

function dismissKey(userId: string) {
  return `welcome-banner-dismissed:${userId}`;
}

/**
 * Messaggio di benvenuto mostrato una volta dopo la registrazione, stesso
 * meccanismo dell'OnboardingBanner: dismissibile, ricordato per utente via
 * localStorage, non riappare più dopo la chiusura.
 */
export function WelcomeBanner({ userId, name }: WelcomeBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(dismissKey(userId)) !== "1");
  }, [userId]);

  if (!visible) return null;

  function dismiss() {
    window.localStorage.setItem(dismissKey(userId), "1");
    setVisible(false);
  }

  const firstName = name.trim().split(/\s+/)[0] ?? name;

  return (
    <div className="relative z-40 border-b border-border bg-gradient-to-r from-surface via-surface to-ember/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 pb-4 pt-20">
        <div>
          <p className="text-base font-bold text-ink">
            Welcome to <span className="text-ember">Zero</span>, {firstName}.
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">
            You&apos;re not just here to watch. You&apos;re here to{" "}
            <span className="text-ember">inspire</span> and to be inspired.
          </p>
        </div>
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
