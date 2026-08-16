"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

type ShareIconButtonProps = {
  path: string;
  label: string;
};

/** Bottone "Condividi" isolato (non un menu): sulle card degli episodi c'è una sola azione reale
 * possibile oggi, nasconderla dietro un menu a tre puntini sarebbe solo un passaggio in più
 * inutile. Copia il link e conferma con un toast (sonner). */
export function ShareIconButton({ path, label }: ShareIconButtonProps) {
  async function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      toast.success("Link copied", { description: label });
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Share ${label}`}
      className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-bg/50 text-ink backdrop-blur-md transition-colors hover:bg-bg/80"
    >
      <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
