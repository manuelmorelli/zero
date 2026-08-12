"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

/** Punteggio di fiducia del creator (lib/profile/trustScore.ts), mostrato ovunque appaia il suo nome nelle card. */
export function TrustScoreBadge({ score }: { score: number }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      className="relative inline-flex items-center gap-1 text-ember"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      {score}
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-[0.65rem] font-medium text-ink shadow-lg">
          Trust Score
        </span>
      )}
    </span>
  );
}
