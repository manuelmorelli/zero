"use client";

import { Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TrustScorePanel } from "@/components/common/TrustScorePanel";
import { useDismiss } from "@/hooks/useDismiss";

/** Trust Score cliccabile nella riga statistiche del Profilo: stesso pannello a comparsa del badge
 * inline (components/common/TrustScoreBadge.tsx). Il pannello è renderizzato in un portal (come
 * components/layout/SideMenu.tsx) invece che ancorato qui con position:absolute: la Hero del
 * Profilo e la barra Overview/Journeys sotto vivono in "stacking context" diversi, quindi un
 * pannello ancorato localmente finiva coperto dai bottoni della barra. Il portal lo rende sempre
 * sopra a tutto il resto della pagina. */
export function ProfileTrustStat({ score }: { score: number | null }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLLIElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  useDismiss([triggerRef, panelRef], () => setOpen(false), open);

  useEffect(() => {
    if (!open) return;
    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setCoords({ top: rect.bottom + 6, left: rect.left });
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <li ref={triggerRef} className="text-center">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full transition duration-300 hover:scale-110 hover:brightness-125"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-1 text-base font-bold leading-tight text-ember">
          <Shield className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          {score ?? "—"}
        </span>
        <p className="text-sm leading-tight text-on-photo-muted">Trust Score</p>
      </button>
      {open &&
        coords &&
        createPortal(
          <span ref={panelRef} className="fixed z-[70]" style={{ top: coords.top, left: coords.left }}>
            <TrustScorePanel onClose={() => setOpen(false)} active={score !== null} />
          </span>,
          document.body
        )}
    </li>
  );
}
