"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Riga di Update da computer: scorre di lato (rotella orizzontale, trascinamento) e mostra le
 * frecce solo quando c'è altro da vedere in quella direzione, come Instagram.
 */
export function UpdatesScroller({ children }: { children: React.ReactNode }) {
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
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  }

  return (
    <div className="relative min-w-0 flex-1">
      <div ref={scrollRef} className="no-scrollbar overflow-x-auto scroll-smooth">
        {children}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll left"
          className="absolute left-0 top-10 flex h-9 w-9 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-scrim text-ink-muted shadow-card backdrop-blur transition-colors hover:border-ember hover:text-ember"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Scroll right"
          className="absolute right-0 top-10 flex h-9 w-9 -translate-y-1/2 translate-x-2 items-center justify-center rounded-full border border-border bg-scrim text-ink-muted shadow-card backdrop-blur transition-colors hover:border-ember hover:text-ember"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
