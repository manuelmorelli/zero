"use client";

import { useState } from "react";

/** Copia il link del profilo negli appunti, con una conferma testuale breve al posto di un toast. */
export function ShareProfileButton() {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Niente clipboard disponibile (permessi/contesto non sicuro): nessuna azione di fallback necessaria.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink-muted"
    >
      {copied ? "Link copied" : "Share Profile"}
    </button>
  );
}
