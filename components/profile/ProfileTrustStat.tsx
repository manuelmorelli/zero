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
  const [coords, setCoords] = useState<{ top: number; left: number; maxHeight?: number } | null>(null);
  const triggerRef = useRef<HTMLLIElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  useDismiss([triggerRef, panelRef], () => setOpen(false), open);

  useEffect(() => {
    if (!open) return;
    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const top = rect.bottom + 6;
      // Su telefono il testo del pannello può superare lo spazio rimasto fino al fondo dello
      // schermo (la statistica sta in alto nella pagina, vedi Hero): senza un limite il testo
      // in fondo resta semplicemente irraggiungibile, niente scroll della pagina lo rivela
      // (il pannello è in un portal con position:fixed). Da desktop in giù c'è sempre spazio
      // a sufficienza, quindi il limite si applica solo sotto md (768px).
      const maxHeight = window.innerWidth < 768 ? Math.max(window.innerHeight - top - 16, 120) : undefined;
      setCoords({ top, left: rect.left, maxHeight });
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
            <TrustScorePanel
              onClose={() => setOpen(false)}
              active={score !== null}
              style={coords.maxHeight !== undefined ? { maxHeight: coords.maxHeight } : undefined}
            />
          </span>,
          document.body
        )}
    </li>
  );
}
