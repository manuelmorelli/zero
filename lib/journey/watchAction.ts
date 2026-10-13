import type { TimelineEpisode } from "@/lib/journey/episodeTimeline";

export type WatchAction = {
  label: string;
  episodeId: string;
};

/**
 * Cosa deve dire e dove deve portare il pulsante principale della pagina Journey, in base a
 * quanto l'utente ha già guardato (`episode.progress`, sempre null se non è loggato).
 * Ordine di priorità: episodio iniziato e non finito, poi il primo non finito, poi "Watch again".
 */
export function getWatchAction(episodes: TimelineEpisode[]): WatchAction | null {
  const first = episodes.at(0);
  if (!first) return null;

  const hasAnyProgress = episodes.some((episode) => episode.progress);
  if (!hasAnyProgress) return { label: "Start", episodeId: first.id };

  const target =
    episodes.find((episode) => episode.progress && !episode.progress.completedAt) ??
    episodes.find((episode) => !episode.progress?.completedAt);
  if (!target) return { label: "Watch again", episodeId: first.id };

  return { label: `Continue watching · Episode ${target.number}`, episodeId: target.id };
}
