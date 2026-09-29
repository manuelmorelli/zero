"use client";

import Link from "next/link";
import {
  TRUST_SCORE_EXPLANATION,
  TRUST_SCORE_INACTIVE_EXPLANATION,
  TRUST_SCORE_LEARN_MORE_HREF,
} from "@/lib/constants/trustScore";

/** Contenuto del pannello a comparsa del Trust Score, condiviso tra il badge inline
 * (components/common/TrustScoreBadge.tsx) e la statistica cliccabile del Profilo
 * (components/profile/ProfileTrustStat.tsx): stesso testo e stesso link in un solo posto.
 * `className` posiziona il pannello rispetto al genitore (che deve avere position:relative).
 * `active=false` mostra il testo per un creator che non ha ancora caricato la presentazione. */
export function TrustScorePanel({
  className = "",
  onClose,
  active = true,
}: {
  className?: string;
  onClose: () => void;
  active?: boolean;
}) {
  return (
    <span
      className={`absolute z-20 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface py-2.5 pl-3 pr-7 text-left text-sm font-medium leading-relaxed text-ink-muted shadow-lg ${className}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
      {active ? TRUST_SCORE_EXPLANATION : TRUST_SCORE_INACTIVE_EXPLANATION}{" "}
      <Link href={TRUST_SCORE_LEARN_MORE_HREF} className="font-semibold text-ember hover:underline">
        Learn More →
      </Link>
    </span>
  );
}
