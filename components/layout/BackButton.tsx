"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const DEPTH_KEY = "zero-nav-depth";
const LAST_PATHNAME_KEY = "zero-last-pathname";

/**
 * Va alla pagina visitata prima di questa nella sessione del browser (come il tasto
 * "indietro"), non a una destinazione fissa: la profondità di navigazione interna al sito
 * si tiene in sessionStorage perché document.referrer non cambia durante una navigazione
 * client-side. Nascosto quando non c'è una pagina precedente in questa sessione (prima
 * visita, link diretto), invece di portare fuori dal sito o non fare nulla.
 */
export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const lastPathname = sessionStorage.getItem(LAST_PATHNAME_KEY);
    let depth = Number(sessionStorage.getItem(DEPTH_KEY) ?? "0");

    if (lastPathname !== pathname) {
      depth += 1;
      sessionStorage.setItem(DEPTH_KEY, String(depth));
      sessionStorage.setItem(LAST_PATHNAME_KEY, pathname);
    }

    setCanGoBack(depth > 1);
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
