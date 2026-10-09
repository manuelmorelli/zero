"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

type HorizontalScrollRowProps = {
  /** Ancora per il collegamento diretto da un'altra pagina (es. Categories in Home). */
  id?: string;
  title: string;
  subtitle?: string;
  /** Icona davanti al titolo (stesso trattamento di SectionHeading, es. le righe della Home). */
  icon?: React.ReactNode;
  /** Rende il titolo un link (es. categoria -> pagina dedicata con tutti i Journey). */
  titleHref?: string;
  children: React.ReactNode;
};

/**
 * Riga di card che scorre solo lateralmente, con frecce cliccabili a sinistra/destra —
 * mai in automatico. Le frecce compaiono solo quando c'è altro da vedere in quella direzione.
 */
export function HorizontalScrollRow({ id, title, subtitle, icon, titleHref, children }: HorizontalScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, children]);

  function scrollByPage(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section id={id} className="scroll-mt-24">
      <SectionHeading icon={icon} title={title} titleHref={titleHref} subtitle={subtitle} />

      <div className="relative mt-4">
        {/* Il contenitore scorrevole taglia tutto ciò che esce dai suoi bordi: il padding dà spazio
            al sollevamento e al bagliore della card al passaggio del mouse, i margini negativi lo
            compensano così l'impaginazione non cambia. */}
        <div ref={scrollRef} className="no-scrollbar -mx-2 -mt-3 -mb-5 flex items-start gap-4 overflow-x-auto scroll-smooth px-2 pt-3 pb-5">
          {children}
        </div>

        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 hidden h-9 w-9 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-scrim text-ink-muted shadow-lg backdrop-blur transition-colors hover:border-ember hover:text-ember sm:flex"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 hidden h-9 w-9 -translate-y-1/2 translate-x-2 items-center justify-center rounded-full border border-border bg-scrim text-ink-muted shadow-lg backdrop-blur transition-colors hover:border-ember hover:text-ember sm:flex"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
