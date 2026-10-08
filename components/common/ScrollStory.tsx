"use client";

import { useEffect, useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { useRichMotion } from "@/hooks/useRichMotion";
import { getGsapScrollTrigger } from "@/lib/gsapClient";

/**
 * Racconto con lo scroll delle pagine vetrina (What is Zero, How it works), regola in
 * docs/21_Motion_Guidelines.md. Dietro c'è la sabbia 3D (components/common/SandBackground.tsx);
 * qui si muovono solo i testi. Ogni elemento sceglie il suo movimento con data-story:
 *
 * - "title":  il titolo in cima si allontana (sale e si spegne) mentre si scorre.
 * - "lines":  il testo entra riga per riga, ogni riga sale da sotto una maschera e passa da sfocata
 *             a nitida. Una volta sola.
 * - "slide":  il riquadro entra di lato da sinistra, legato allo scroll.
 * - "rise":   i figli diretti salgono uno dopo l'altro, legati allo scroll.
 * - "finale": la frase di chiusura cresce e si accende mentre arriva al centro dello schermo.
 *
 * Solo da computer e mai per chi ha chiesto meno movimento: lì la pagina resta ferma e completa,
 * come anche senza JavaScript.
 */

const EASE_OUT = "expo.out";
const LINE_DURATION = 0.9;
const LINE_STAGGER = 0.08;
/** Tratto di scroll in cui il titolo si allontana. */
const TITLE_EXIT_SCROLL = 500;

export function ScrollStory({ children, className }: { children: React.ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rich = useRichMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!rich || !root) return;
    const { gsap } = getGsapScrollTrigger();
    gsap.registerPlugin(SplitText);
    const pick = (story: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-story="${story}"]`));
    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      pick("title").forEach((title) => {
        gsap.to(title, {
          yPercent: -30,
          opacity: 0.3,
          ease: "none",
          // Parte da pagina ferma in cima: all'apertura il titolo è pieno, poi si allontana.
          scrollTrigger: { start: 0, end: TITLE_EXIT_SCROLL, scrub: true },
        });
      });

      pick("lines").forEach((block) => {
        const split = SplitText.create(block, { type: "lines", mask: "lines" });
        splits.push(split);
        gsap.from(split.lines, {
          yPercent: 110,
          filter: "blur(8px)",
          duration: LINE_DURATION,
          stagger: LINE_STAGGER,
          ease: EASE_OUT,
          scrollTrigger: { trigger: block, start: "top 88%", once: true },
        });
      });

      pick("slide").forEach((panel) => {
        gsap.from(panel, {
          xPercent: -18,
          opacity: 0,
          ease: "power2.out",
          scrollTrigger: { trigger: panel, start: "top 95%", end: "top 60%", scrub: 0.6 },
        });
      });

      pick("rise").forEach((group) => {
        gsap.from(Array.from(group.children), {
          yPercent: 60,
          opacity: 0,
          stagger: 0.25,
          ease: "power2.out",
          scrollTrigger: { trigger: group, start: "top 95%", end: "top 45%", scrub: 0.6 },
        });
      });

      pick("finale").forEach((finale) => {
        gsap.from(finale, {
          scale: 0.82,
          opacity: 0.15,
          transformOrigin: "left center",
          ease: "power2.out",
          scrollTrigger: { trigger: finale, start: "top 100%", end: "center 60%", scrub: 0.6 },
        });
      });
    }, root);

    return () => {
      ctx.revert();
      splits.forEach((split) => split.revert());
    };
  }, [rich]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
