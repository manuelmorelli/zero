"use client";

import Image from "next/image";
import { useState } from "react";
import { EpisodeVideoPlayer } from "@/components/journey/EpisodeVideoPlayer";
import type { TimelineEpisode, TimelineGroup } from "@/lib/journey/episodeTimeline";

type EpisodeTimelineListProps = {
  groups: TimelineGroup[];
  coverUrl: string | null;
  journeyTitle: string;
};

/** Elenco verticale "stile scheda serie": righe piccole (foto a sinistra, "Episode N" a destra),
 * raggruppate per Capitolo quando presente. Cliccando una riga il video si apre in un riquadro
 * a schermo intero, invece di restare incastrato in una card piccola. */
export function EpisodeTimelineList({ groups, coverUrl, journeyTitle }: EpisodeTimelineListProps) {
  const [openEpisode, setOpenEpisode] = useState<TimelineEpisode | null>(null);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.chapterId ?? "loose"}>
          {group.chapterTitle && (
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-faint">
              {group.chapterTitle}
            </h2>
          )}
          <div className="space-y-2">
            {group.episodes.map((episode) => (
              <EpisodeRow
                key={episode.id}
                episode={episode}
                coverUrl={coverUrl}
                onOpen={() => setOpenEpisode(episode)}
              />
            ))}
          </div>
        </div>
      ))}

      {openEpisode && (
        <EpisodeOverlay
          episode={openEpisode}
          journeyTitle={journeyTitle}
          onClose={() => setOpenEpisode(null)}
        />
      )}
    </div>
  );
}

function EpisodeRow({
  episode,
  coverUrl,
  onOpen,
}: {
  episode: TimelineEpisode;
  coverUrl: string | null;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      id={episode.id}
      onClick={onOpen}
      className="group flex w-full scroll-mt-16 items-center overflow-hidden rounded-xl border border-border bg-surface text-left transition-colors hover:border-ink-muted"
    >
      <div className="relative aspect-square w-20 flex-shrink-0 overflow-hidden bg-surface-2">
        {coverUrl ? (
          <Image src={coverUrl} alt="" fill sizes="80px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
        )}
        {episode.videoKey && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <PlayIcon className="h-5 w-5 text-white" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
          Episode {episode.number}
        </p>
        <h3 className="mt-1 text-sm font-bold leading-snug text-ink">{episode.title}</h3>
      </div>
    </button>
  );
}

function EpisodeOverlay({
  episode,
  journeyTitle,
  onClose,
}: {
  episode: TimelineEpisode;
  journeyTitle: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              {journeyTitle} — Episode {episode.number}
            </p>
            <h3 className="text-base font-bold text-ink">{episode.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-ink-muted transition-colors hover:text-ink"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {episode.videoKey && episode.videoSrc ? (
          <EpisodeVideoPlayer episodeId={episode.id} src={episode.videoSrc} />
        ) : (
          <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
            No video for this episode yet.
          </p>
        )}

        {episode.caption && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-ink-muted">{episode.caption}</p>
        )}
      </div>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2 1.5v9l8-4.5-8-4.5z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
    </svg>
  );
}
