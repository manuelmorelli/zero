"use client";

import { useEffect, useRef } from "react";
import { getGsapScrollTrigger, prefersLightMotion } from "@/lib/gsapClient";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, summary";

/**
 * Cursore custom sottile, solo su desktop (pointer fine + hover reale, mai su touch): segue il
 * mouse con un leggero ritardo elastico e si ingrandisce sopra elementi interattivi. Disattivo
 * anche con prefers-reduced-motion, coerente con `prefersLightMotion()` già usato altrove.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!supportsFinePointer || prefersLightMotion()) return;

    const dot = dotRef.current;
    if (!dot) return;

    const { gsap } = getGsapScrollTrigger();
    document.documentElement.classList.add("custom-cursor-active");
    gsap.set(dot, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });

    const moveX = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3.out" });
    const moveY = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3.out" });

    function handleMove(e: MouseEvent) {
      moveX(e.clientX);
      moveY(e.clientY);
      gsap.to(dot, { opacity: 1, scale: 1, duration: 0.3, overwrite: "auto" });
    }

    function handleOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const interactive = target.closest(INTERACTIVE_SELECTOR);
      gsap.to(dot, { scale: interactive ? 2.5 : 1, duration: 0.25, ease: "power2.out", overwrite: "auto" });
    }

    function handleLeaveWindow() {
      gsap.to(dot, { opacity: 0, duration: 0.2, overwrite: "auto" });
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);
    document.documentElement.addEventListener("mouseleave", handleLeaveWindow);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      document.documentElement.removeEventListener("mouseleave", handleLeaveWindow);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-5 w-5 rounded-full border border-white/60 mix-blend-difference"
    />
  );
}
