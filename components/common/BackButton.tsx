"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  /** Dove andare se non c'è una vera pagina precedente nella cronologia (es. link diretto, nuova scheda). */
  fallbackHref: string;
  label?: string;
  className?: string;
};

/** Pulsante "indietro" esplicito nell'interfaccia, invece di far dipendere l'utente dal tasto del browser. */
export function BackButton({ fallbackHref, label = "Back", className }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink ${className ?? ""}`}
    >
      <ArrowLeftIcon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
