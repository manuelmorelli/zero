"use client";

import { Pause, Play } from "lucide-react";
import { VideoPlayer } from "@/components/common/VideoPlayer";
import { useMomentsTrailer, type TrailerMoment } from "@/hooks/useMomentsTrailer";
import { formatDuration } from "@/lib/format/duration";
import { ButtonSecondary } from "@/components/ui/button";

type MomentsTrailerPlayerProps = {
  videoSrc: string;
  posterUrl?: string | null;
  moments: TrailerMoment[];
};

/**
 * Il "trailer" di un episodio: riusa il player video del sito (components/common/VideoPlayer) e
 * usa useMomentsTrailer per fargli saltare tra i momenti migliori già salvati, invece di scorrere
 * dal secondo 0 in avanti. Un solo comando: play/pausa.
 */
export function MomentsTrailerPlayer({ videoSrc, posterUrl, moments }: MomentsTrailerPlayerProps) {
  const { playerRef, playing, toggle, currentMoment } = useMomentsTrailer(videoSrc, moments);

  return (
    <div className="grid gap-3">
      <VideoPlayer ref={playerRef} posterUrl={posterUrl} showSkipBack={false} />
      <div className="flex items-center gap-3">
        <ButtonSecondary onClick={toggle} disabled={moments.length === 0}>
          {playing ? (
            <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
          )}
          {playing ? "Pausa trailer" : "Riproduci trailer"}
        </ButtonSecondary>
        <span className="text-sm text-ink-muted">{moments.length} momenti</span>
      </div>
      {currentMoment && (
        <p className="text-sm text-ink-muted">
          <span className="tabular-nums text-ember">{formatDuration(currentMoment.timestampSec)}</span>
          {currentMoment.description && <>{": "}{currentMoment.description}</>}
        </p>
      )}
    </div>
  );
}
