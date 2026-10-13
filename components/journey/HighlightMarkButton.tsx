"use client";

import { Star } from "lucide-react";
import { MAX_MANUAL_HIGHLIGHTS, MIN_HIGHLIGHT_GAP_SECONDS, MIN_MANUAL_HIGHLIGHTS } from "@/lib/constants/moments";

type HighlightMarkButtonProps = {
  count: number;
  full: boolean;
  disabled: boolean;
  onMark: () => void;
};

/**
 * La stellina per segnare il secondo in corso come "momento migliore" (lib/actions/episodeMoments.ts):
 * vive dentro alla barra di controllo del player (VideoPlayer.extraControl, a fianco dei minuti),
 * così chi pubblica la vede subito mentre guarda, invece che sotto il titolo dove passava inosservata.
 */
export function HighlightMarkButton({ count, full, disabled, onMark }: HighlightMarkButtonProps) {
  const trailerReady = count >= MIN_MANUAL_HIGHLIGHTS;

  return (
    <span className="group/star relative inline-flex items-center">
      <button
        type="button"
        onClick={onMark}
        disabled={disabled || full}
        aria-label="Mark this moment as one of the episode's best"
        className="flex items-center gap-1 text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Star className="h-5 w-5" fill={count > 0 ? "currentColor" : "none"} aria-hidden="true" />
        <span className="tabular-nums">{count}/{MAX_MANUAL_HIGHLIGHTS}</span>
      </button>
      <span className="video-tooltip pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-56 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2 text-center text-sm leading-snug text-ink-muted opacity-0 shadow-lg transition-opacity md:group-hover/star:block md:group-hover/star:opacity-100">
        {full
          ? `You've starred ${MAX_MANUAL_HIGHLIGHTS} moments, the maximum. Your trailer will use these.`
          : trailerReady
            ? `Your trailer will use these moments. You can star up to ${MAX_MANUAL_HIGHLIGHTS}, at least ${MIN_HIGHLIGHT_GAP_SECONDS}s apart.`
            : `Star the best moments of this episode to build its trailer. Star ${MIN_MANUAL_HIGHLIGHTS - count} more, at least ${MIN_HIGHLIGHT_GAP_SECONDS}s apart.`}
      </span>
    </span>
  );
}
