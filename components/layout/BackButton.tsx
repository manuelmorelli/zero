"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const STACK_KEY = "zero-nav-stack";
const MAX_STACK = 50;

// useLayoutEffect non esiste lato server (React avvisa se lo si usa durante il render
// sul server): su una pagina servita da Next questo componente viene comunque preparato
// una prima volta sul server, quindi qui si sceglie l'uno o l'altro in base a dove gira.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Un modulo JS viene rivalutato solo a un caricamento pagina vero e proprio (prima visita,
// refresh, arrivo da un link esterno come Google), mai durante una navigazione client-side
// interna al sito (che riusa lo stesso documento): questa variabile parte quindi "true" esattamente
// una volta per ogni reale ingresso nel sito, a differenza di sessionStorage che invece sopravvive
// anche quando si lascia il sito e si torna nella stessa scheda — motivo per cui senza questo
// controllo lo stack restava "sporco" di una visita precedente e il pulsante compariva subito.
let freshDocumentLoad = true;

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
 * visita, link diretto, refresh), invece di portare fuori dal sito o non fare nulla.
 *
 * Tiene uno stack di pathname invece di un semplice contatore: un contatore che cresce a
 * ogni cambio pagina (senza mai scendere quando si torna indietro) finiva per mostrare il
 * pulsante anche in Home dopo un solo giro avanti/indietro, e un secondo click portava fuori
 * dal sito (alla pagina precedente vera del browser, es. Google) invece di restare su Zero.
 *
 * Se il pathname corrente è già presente nello stack (non solo in cima o al secondo posto,
 * es. si torna a Home cliccando il logo da tre pagine di profondità, non con "Back"), lo stack
 * si accorcia fino a quel punto invece di aggiungere un duplicato in fondo: altrimenti il
 * pulsante restava visibile anche su una pagina "di partenza" già vista in questa sessione.
 */
export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [canGoBack, setCanGoBack] = useState(false);

  // useLayoutEffect invece di useEffect: applica il valore corretto prima che il browser
  // disegni la pagina, così durante una transizione animata non si vede per un istante
  // il pulsante nel suo stato vecchio (es. ancora visibile per un attimo in Home) prima
  // che si aggiorni — con useEffect quella correzione arriva un frame troppo tardi.
  useIsomorphicLayoutEffect(() => {
    const stack = freshDocumentLoad ? [] : readStack();
    freshDocumentLoad = false;

    const existingIndex = stack.lastIndexOf(pathname);
    const nextStack =
      existingIndex !== -1 ? stack.slice(0, existingIndex + 1) : [...stack, pathname].slice(-MAX_STACK);

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
      className={`inline-flex items-center gap-1 text-sm font-medium text-ember transition-colors hover:text-ink ${className ?? ""}`}
    >
      <ArrowLeft className="h-5 w-5" /> Back
    </button>
  );
}
