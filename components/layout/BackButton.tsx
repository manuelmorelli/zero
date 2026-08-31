"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const STACK_KEY = "zero-nav-stack";
const MAX_STACK = 50;

function readStack(): string[] {
  try {
    const raw = sessionStorage.getItem(STACK_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Va alla pagina visitata prima di questa nella sessione del browser (come il tasto
 * "indietro"), non a una destinazione fissa: la profondità di navigazione interna al sito
 * si tiene in sessionStorage perché document.referrer non cambia durante una navigazione
 * client-side. Nascosto quando non c'è una pagina precedente in questa sessione (prima
 * visita, link diretto), invece di portare fuori dal sito o non fare nulla.
 *
 * Tiene uno stack di pathname invece di un semplice contatore: un contatore che cresce a
 * ogni cambio pagina (senza mai scendere quando si torna indietro) finiva per mostrare il
 * pulsante anche in Home dopo un solo giro avanti/indietro, e un secondo click portava fuori
 * dal sito (alla pagina precedente vera del browser, es. Google) invece di restare su Zero.
 */
export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const stack = readStack();
    const top = stack[stack.length - 1];
    const belowTop = stack[stack.length - 2];

    let nextStack: string[];
    if (pathname === top) {
      nextStack = stack;
    } else if (pathname === belowTop) {
      // Stesso pathname di due passi fa: siamo tornati indietro di una pagina.
      nextStack = stack.slice(0, -1);
    } else {
      nextStack = [...stack, pathname].slice(-MAX_STACK);
    }

    sessionStorage.setItem(STACK_KEY, JSON.stringify(nextStack));
    // Sincronizza lo stato React con sessionStorage (fonte esterna) dopo un cambio pagina.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanGoBack(nextStack.length > 1);
  }, [pathname]);

  if (!canGoBack) return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`text-sm font-medium text-ember transition-colors hover:text-ink ${className ?? ""}`}
    >
      ← Back
    </button>
  );
}
