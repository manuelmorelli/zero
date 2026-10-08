"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { DESKTOP_QUERY, REDUCED_MOTION_QUERY } from "@/hooks/useRichMotion";

/**
 * Sfondo di sabbia dorata delle pagine "vetrina" (docs/21_Motion_Guidelines.md): fiume 3D da
 * computer, immagine ferma dello stesso fiume su telefono e tablet (il 3D in movimento pesa sulla
 * batteria), un fotogramma fermo per chi ha chiesto meno movimento. Non compare dove si lavora o si
 * guarda un video (Dashboard, Impostazioni, Messaggi, moduli, Player): lì distrarrebbe.
 */

/** Pagine con la sabbia: Home, liste, profili e pagine di presentazione. */
const SAND_ROUTES = [/^\/$/, /^\/journeys$/, /^\/journeyers$/, /^\/profile\/[^/]+$/, /^\/what-is-zero$/, /^\/how-it-works$/];

type SandMode = "none" | "still-image" | "still-frame" | "live";

function getSandMode(): SandMode {
  if (!window.matchMedia(DESKTOP_QUERY).matches) return "still-image";
  return window.matchMedia(REDUCED_MOTION_QUERY).matches ? "still-frame" : "live";
}

function subscribe(onChange: () => void) {
  const lists = [DESKTOP_QUERY, REDUCED_MOTION_QUERY].map((query) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
}

export function SandBackground() {
  const pathname = usePathname();
  const mode = useSyncExternalStore<SandMode>(subscribe, getSandMode, () => "none");
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const onSandRoute = SAND_ROUTES.some((route) => route.test(pathname));
  const webgl = onSandRoute && (mode === "live" || mode === "still-frame");

  useEffect(() => {
    if (!webgl || !backRef.current || !frontRef.current) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    // three.js si scarica solo qui, solo da computer: non pesa mai sul telefono.
    import("@/lib/sand/sandScene").then(({ startSand }) => {
      if (cancelled || !backRef.current || !frontRef.current) return;
      stop = startSand(backRef.current, frontRef.current, { animate: mode === "live" });
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [webgl, mode]);

  if (!onSandRoute || mode === "none") return null;

  if (mode === "still-image") {
    return <div aria-hidden="true" className="sand-still pointer-events-none fixed inset-0 -z-10" />;
  }

  return (
    <>
      {/* Dietro ai contenuti: il fiume, visibile tra una card e l'altra. */}
      <canvas ref={backRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen" />
      {/* Davanti: pochi granelli grandi e sfocati, sotto la barra in alto e i menu. Niente
       * mix-blend: fondere il canvas con tutta la pagina a ogni immagine rallentava il resto. */}
      <canvas ref={frontRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 h-screen w-screen" />
    </>
  );
}
