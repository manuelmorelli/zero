import Image from "next/image";
import Link from "next/link";
import type { TimelineEpisode } from "@/lib/journey/episodeTimeline";

type UpNextListProps = {
  journeyId: string;
  journeyTitle: string;
  coverUrl: string | null;
  episodes: TimelineEpisode[];
  activeEpisodeId: string;
};

/** Sidebar "Up next" della pagina Player: tutti gli episodi del Journey, quello attivo evidenziato. */
export function UpNextList({ journeyId, journeyTitle, coverUrl, episodes, activeEpisodeId }: UpNextListProps) {
  return (
    <aside className="min-w-0">
      <h2 className="text-sm font-bold tracking-tight">Up next</h2>
      <p className="mt-1 text-xs text-ink-muted">{journeyTitle}</p>
      <ul className="mt-3 space-y-2 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
        {episodes.map((episode) => {
          const active = episode.id === activeEpisodeId;
          return (
            <li key={episode.id}>
              <Link
                href={`/journeys/${journeyId}/episodes/${episode.id}`}
                className={`group flex items-center gap-3 rounded-xl border p-2 transition-colors ${
                  active
                    ? "border-ember/40 bg-ember/10"
                    : "border-border bg-surface hover:border-ink-muted"
                }`}
              >
                <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
                  {coverUrl ? (
                    <Image src={coverUrl} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.6rem] tracking-[0.18em] text-ink-muted uppercase">
                    Episode {episode.number}
                  </span>
                  <span
                    className={`mt-0.5 block truncate text-[0.8rem] font-semibold transition-colors ${
                      active ? "text-ink" : "group-hover:text-ember"
                    }`}
                  >
                    {episode.title}
                  </span>
                  {episode.progress?.completedAt && (
                    <span className="mt-0.5 block text-[0.65rem] text-ink-muted">Completed</span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
