import Image from "next/image";
import Link from "next/link";
import type { TimelineEpisode } from "@/lib/journey/episodeTimeline";
import { SectionTitle } from "@/components/ui/heading";
import { ROW } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

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
      <SectionTitle>{journeyTitle}</SectionTitle>
      <p className="mt-1 text-base text-ember">
        {episodes.length} {episodes.length === 1 ? "Episode" : "Episodes"}
      </p>
      <ul className="mt-3 space-y-2 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
        {episodes.map((episode) => {
          const active = episode.id === activeEpisodeId;
          return (
            <li key={episode.id}>
              <Link
                href={`/journeys/${journeyId}/episodes/${episode.id}`}
                className={cn(ROW, "group flex items-center gap-3", active ? "border-ember-line bg-ember-soft" : "bg-transparent")}
              >
                <span className="relative aspect-4/3 w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
                  {episode.posterUrl || coverUrl ? (
                    <Image src={episode.posterUrl || coverUrl!} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 cover-placeholder" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm tracking-[0.18em] text-ember uppercase">
                    Episode {episode.number}
                  </span>
                  <span
                    className={`mt-0.5 block truncate text-base font-semibold transition-colors ${
                      active ? "text-ink" : "group-hover:text-ember"
                    }`}
                  >
                    {episode.title}
                  </span>
                  {episode.progress?.completedAt && (
                    <span className="mt-0.5 block text-sm text-ink-muted">Completed</span>
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
