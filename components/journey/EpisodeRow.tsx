import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { TimelineEpisode } from "@/lib/journey/episodeTimeline";
import { ROW } from "@/components/ui/panel";
import { CoverMenu } from "@/components/journey/CoverMenu";
import { ExpandableText } from "@/components/common/ExpandableText";
import { SponsoredLabel } from "@/components/common/SponsoredLabel";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format/duration";
import { COVER_IMAGE_QUALITY } from "@/lib/constants/image";

type EpisodeRowProps = {
  episode: TimelineEpisode;
  journeyId: string;
  coverUrl: string | null;
  isOwnContent: boolean;
  isLoggedIn: boolean;
  /** Solo nella pagina del player: l'episodio che si sta guardando è evidenziato. */
  active?: boolean;
};

/** Riga episodio: UNICA per la pagina del Journey e per la lista "Up next" del player. */
export function EpisodeRow({ episode, journeyId, coverUrl, isOwnContent, isLoggedIn, active = false }: EpisodeRowProps) {
  const episodeHref = `/journeys/${journeyId}/episodes/${episode.id}`;
  return (
    <li>
      <div
        id={episode.id}
        className={cn(
          ROW,
          "group flex w-full max-w-[420px] scroll-mt-24 items-start gap-3 p-2 text-left transition-transform duration-300 hover:-translate-y-0.5",
          active && "border-ember-line bg-ember-soft"
        )}
      >
        {/* Copertina piccola, stessa proporzione 16:9 delle copertine episodio in tutto il
         * sito, più il menu a tre puntini nella stessa posizione (sopra la copertina, in alto
         * a destra). */}
        <div className="flex shrink-0 flex-col">
          <div className="group/thumb relative aspect-video w-36 shrink-0 sm:w-44 md:w-48">
            <Link href={episodeHref} className="absolute inset-0 block overflow-hidden rounded-lg border border-border bg-surface-2">
              {episode.posterUrl || coverUrl ? (
                <Image
                  src={episode.posterUrl || coverUrl!}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 192px, 176px"
                  quality={COVER_IMAGE_QUALITY}
                  className="object-cover transition-transform duration-700 group-hover/thumb:scale-105"
                />
              ) : (
                <div className="absolute inset-0 cover-placeholder transition-transform duration-700 group-hover/thumb:scale-105" />
              )}
              <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover/thumb:opacity-100">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-scrim backdrop-blur-md transition-transform duration-300 group-hover/thumb:scale-110">
                  <Play className="h-3 w-3 translate-x-[1px] fill-current text-ember" aria-hidden="true" />
                </span>
              </span>
            </Link>
            <div className="absolute right-1.5 top-1.5 z-10 max-md:opacity-100 transition-opacity duration-200 md:opacity-0 md:focus-within:opacity-100 md:group-hover/thumb:opacity-100">
              <CoverMenu
                forumHref={`/community/forum/${journeyId}`}
                report={!isOwnContent && isLoggedIn ? { targetType: "EPISODE", targetId: episode.id } : undefined}
                editHref={isOwnContent ? `/dashboard/journeys/${journeyId}?edit=${episode.id}` : undefined}
                editLabel="Edit Episode"
                className="grid h-7 w-7 place-items-center rounded-full border border-border bg-scrim text-ember backdrop-blur-md transition-colors hover:bg-scrim"
              />
            </div>
          </div>
          {episode.progress && (
            <p className="mt-1 hidden text-sm font-semibold text-ink-muted md:block">
              {episode.progress.completedAt ? "Watched" : "Resume"}
            </p>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={episodeHref} className="block">
            <span className="flex flex-wrap items-center gap-2">
              <span className="shrink-0 text-sm font-bold tracking-[0.18em] text-ember uppercase md:font-normal">
                Episode {episode.number}
              </span>
              {episode.durationSec !== null && (
                <span className="shrink-0 text-sm text-ember">{formatDuration(episode.durationSec)}</span>
              )}
              {episode.progress && (
                <span className="shrink-0 text-sm font-semibold text-ember md:hidden">
                  · {episode.progress.completedAt ? "Watched" : "Resume"}
                </span>
              )}
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold transition-colors group-hover:text-ember md:line-clamp-2 md:whitespace-normal">
              {episode.title}
            </span>
            {episode.isSponsored && <SponsoredLabel className="mt-1" />}
          </Link>
          {/* Fuori dal Link: il tocco su "more" deve aprire la caption, non andare all'episodio. */}
          {episode.caption && (
            <ExpandableText text={episode.caption} clampLines={2} className="mt-4 text-sm text-ink-muted" />
          )}
        </div>
      </div>
    </li>
  );
}
