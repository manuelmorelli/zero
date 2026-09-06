"use client";

import { useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useDismiss } from "@/hooks/useDismiss";
import { TrustScorePanel } from "@/components/common/TrustScorePanel";

/** Punteggio di fiducia del creator (lib/profile/trustScore.ts), mostrato ovunque appaia il suo
 * nome nelle card. Il pannello si apre al click/tocco: un tooltip al passaggio del mouse non
 * funzionerebbe su schermo touch, dove non esiste hover. */
export function TrustScoreBadge({ score }: { score: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useDismiss(ref, () => setOpen(false), open);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 text-ember"
        aria-expanded={open}
      >
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        {score}
      </button>
      {open && (
        <TrustScorePanel className="bottom-full left-1/2 mb-1.5 -translate-x-1/2" onClose={() => setOpen(false)} />
      )}
    </span>
  );
}
