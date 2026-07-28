"use client";

import { useRef } from "react";
import { recordEpisodeProgress } from "@/lib/actions/progress";

type EpisodeVideoPlayerProps = {
  episodeId: string;
  src: string;
};

export function EpisodeVideoPlayer({ episodeId, src }: EpisodeVideoPlayerProps) {
  const started = useRef(false);

  return (
    <video
      controls
      preload="metadata"
      src={src}
      onPlay={() => {
        if (started.current) return;
        started.current = true;
        recordEpisodeProgress(episodeId);
      }}
      className="mt-3 w-full rounded-lg bg-ink"
    />
  );
}
