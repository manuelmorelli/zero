"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addManualHighlight, deleteManualHighlight } from "@/lib/actions/episodeMoments";
import { MAX_MANUAL_HIGHLIGHTS } from "@/lib/constants/moments";

export type Highlight = { id: string; timestampSec: number };

/**
 * Stato e azioni della stellina (segnare/togliere un momento a mano, lib/actions/episodeMoments.ts):
 * condiviso tra il bottone compatto dentro al player e la lista sotto, entrambi in EpisodePlayer.
 */
export function useHighlightMarker(episodeId: string, initialHighlights: Highlight[]) {
  const [highlights, setHighlights] = useState(initialHighlights);
  const [isPending, startTransition] = useTransition();

  function mark(rawTimestampSec: number) {
    const timestampSec = Math.max(0, Math.floor(rawTimestampSec));
    startTransition(async () => {
      const result = await addManualHighlight(episodeId, timestampSec);
      if ("id" in result) {
        setHighlights((current) => [...current, { id: result.id, timestampSec }].sort((a, b) => a.timestampSec - b.timestampSec));
      } else {
        toast.error(result.error);
      }
    });
  }

  function remove(id: string) {
    const removed = highlights.find((item) => item.id === id);
    setHighlights((current) => current.filter((item) => item.id !== id));
    startTransition(async () => {
      try {
        await deleteManualHighlight(id);
      } catch {
        if (removed) setHighlights((current) => [...current, removed].sort((a, b) => a.timestampSec - b.timestampSec));
      }
    });
  }

  return { highlights, isPending, mark, remove, full: highlights.length >= MAX_MANUAL_HIGHLIGHTS };
}
