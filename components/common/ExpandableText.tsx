"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ClampLines = 1 | 2 | 4;

type ExpandableTextProps = {
  text: string;
  /** Righe visibili da chiuso: 4 per la descrizione del Journey, 2 per la caption dell'episodio
   * (vedi mockup YouTube-style approvato da Manuel). */
  clampLines: ClampLines;
  className?: string;
};

const CLAMP_CLASS: Record<ClampLines, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  4: "line-clamp-4",
};

/** Testo troncato con "more" in fondo, stile YouTube: "more" compare solo se il testo sfora
 * davvero le righe visibili da chiuso (misurato nel browser, non lo si può sapere lato server), e
 * un tocco qualsiasi sul testo già aperto lo richiude. Usato solo nel ramo mobile delle pagine
 * Journey/Episodio (md:hidden attorno a chi la chiama): da computer il testo resta sempre intero,
 * invariato. */
export function ExpandableText({ text, clampLines, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    function measure() {
      const el = ref.current;
      if (!el) return;
      setOverflowing(el.scrollHeight > el.clientHeight + 1);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text, clampLines]);

  if (expanded) {
    return (
      <p onClick={() => setExpanded(false)} className={cn("cursor-pointer", className)}>
        {text}
      </p>
    );
  }

  return (
    <div>
      <p ref={ref} className={cn(CLAMP_CLASS[clampLines], className)}>
        {text}
      </p>
      {overflowing && (
        <button type="button" onClick={() => setExpanded(true)} className="mt-0.5 text-sm font-semibold text-ink-muted">
          more
        </button>
      )}
    </div>
  );
}
