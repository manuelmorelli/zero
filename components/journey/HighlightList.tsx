"use client";

import { X } from "lucide-react";
import { formatDuration } from "@/lib/format/duration";
import type { Highlight } from "@/hooks/useHighlightMarker";

type HighlightListProps = {
  highlights: Highlight[];
  onRemove: (id: string) => void;
};

/** Elenco dei momenti già segnati a mano (stellina nel player), con una (x) per toglierli. */
export function HighlightList({ highlights, onRemove }: HighlightListProps) {
  if (highlights.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {highlights.map((highlight) => (
        <li
          key={highlight.id}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-1 text-sm text-ink-muted"
        >
          <span className="tabular-nums">{formatDuration(highlight.timestampSec)}</span>
          <button
            type="button"
            onClick={() => onRemove(highlight.id)}
            aria-label={`Remove moment at ${formatDuration(highlight.timestampSec)}`}
            className="text-ink-faint transition-colors hover:text-ember"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
