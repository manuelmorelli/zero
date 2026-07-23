"use client";

import { recordEpisodeProgress } from "@/lib/actions/progress";

type WatchEpisodeButtonProps = {
  episodeId: string;
  videoUrl: string;
};

export function WatchEpisodeButton({ episodeId, videoUrl }: WatchEpisodeButtonProps) {
  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        recordEpisodeProgress(episodeId);
      }}
      className="mt-3 inline-block text-sm font-medium text-ink underline underline-offset-2"
    >
      Watch video
    </a>
  );
}
