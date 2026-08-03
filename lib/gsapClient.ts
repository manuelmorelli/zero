"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Registra ScrollTrigger una sola volta e restituisce gsap + ScrollTrigger.
 * Non è un React hook (nessuna regola di hook si applica): il nome evita "use*"
 * di proposito per non confondere l'eslint plugin react-hooks.
 */
export function getGsapScrollTrigger() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/**
 * True su dispositivi touch (telefoni/tablet, `pointer: coarse`) o quando l'utente ha chiesto
 * meno animazioni: usato per alleggerire gli effetti GSAP più pesanti. Volutamente non basato
 * su una larghezza di viewport (`max-width`): uno zoom del browser o una finestra desktop non
 * massimizzata possono scendere sotto qualunque soglia in pixel senza che il dispositivo sia
 * realmente mobile, disattivando gli effetti "wow" anche su desktop (bug reale riscontrato).
 */
export function prefersLightMotion(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
