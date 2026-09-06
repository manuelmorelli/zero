"use client";

import { useEffect, type RefObject } from "react";

/** Chiude un pannello a comparsa al click/tocco fuori dall'area indicata da `refs`, o al tasto
 * Escape. Accetta più ref quando il pannello è renderizzato altrove nel DOM (es. un portal). */
export function useDismiss(
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  onDismiss: () => void,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;
    const list = Array.isArray(refs) ? refs : [refs];
    function onPointerDown(event: PointerEvent) {
      const isInside = list.some((ref) => ref.current?.contains(event.target as Node));
      if (!isInside) onDismiss();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onDismiss]);
}
