"use client";

import { useEffect, useRef } from "react";
import { getGsapScrollTrigger } from "@/lib/gsapClient";

type SplitRevealProps = {
  /** Ogni stringa è una riga separata, rivelata in sequenza (fade + slide) quando entra in viewport. */
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
};

export function SplitReveal({ lines, className, lineClassName, delay = 0 }: SplitRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLElement>("[data-split-line]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      items.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      return;
    }

    const { gsap, ScrollTrigger } = getGsapScrollTrigger();
    gsap.set(items, { opacity: 0, y: 24 });

    const tween = gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power2.out",
      stagger: 0.08,
      delay,
      scrollTrigger: {
        trigger: container,
        start: "top 85%",
        once: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      ScrollTrigger.refresh();
    };
  }, [lines, delay]);

  return (
    <div ref={containerRef} className={className}>
      {lines.map((line, index) => (
        <div key={index} data-split-line className={lineClassName}>
          {line}
        </div>
      ))}
    </div>
  );
}
