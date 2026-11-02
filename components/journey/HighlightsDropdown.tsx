"use client";

import { useRef, useState } from "react";
import { Star, X } from "lucide-react";
import { useDismiss } from "@/hooks/useDismiss";
import { formatDuration } from "@/lib/format/duration";
import type { Highlight } from "@/hooks/useHighlightMarker";
import { CHIP, PANEL } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

type HighlightsDropdownProps = {
  highlights: Highlight[];
  onRemove: (id: string) => void;
  className?: string;
};

/** Stessi momenti di HighlightList ma raccolti in un menu a tendina "Highlights (N)" invece di
 * pillole in linea: su uno schermo stretto, due o più pillole accanto a "Episode N" sforerebbero.
 * Visibile solo al creator (stesso filtro di HighlightList, deciso da chi la usa). */
export function HighlightsDropdown({ highlights, onRemove, className }: HighlightsDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, () => setOpen(false), open);

  if (highlights.length === 0) return null;

  return (
    <div ref={ref} className={className ?? "relative"}>
      <button type="button" onClick={() => setOpen((prev) => !prev)} aria-expanded={open} className={CHIP}>
        <Star className="h-3.5 w-3.5 text-ember" fill="currentColor" aria-hidden="true" />
        Highlights ({highlights.length}) <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className={cn(PANEL, "absolute right-0 top-9 z-20 w-48 p-1.5 shadow-2xl")}>
          {highlights.map((highlight) => (
            <div key={highlight.id} className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-ink">
              <span className="tabular-nums">{formatDuration(highlight.timestampSec)}</span>
              <button
                type="button"
                onClick={() => onRemove(highlight.id)}
                aria-label={`Remove moment at ${formatDuration(highlight.timestampSec)}`}
                className="text-ink-faint transition-colors hover:text-ember"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
