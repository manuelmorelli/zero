"use client";

import { useSyncExternalStore } from "react";

/** Computer = mouse vero, non una larghezza in pixel (stesso criterio di lib/gsapClient.ts). */
export const DESKTOP_QUERY = "(hover: hover) and (pointer: fine)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function getRichMotion(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches && !window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function subscribe(onChange: () => void) {
  const lists = [DESKTOP_QUERY, REDUCED_MOTION_QUERY].map((query) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
}

/**
 * True quando sono ammessi gli effetti di scroll scenici (docs/21_Motion_Guidelines.md): solo da
 * computer e mai per chi ha chiesto meno movimento. Lato server vale false: la pagina parte sempre
 * nella versione ferma e completa, gli effetti si aggiungono solo dopo il caricamento.
 */
export function useRichMotion(): boolean {
  return useSyncExternalStore(subscribe, getRichMotion, () => false);
}
