import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import type { TimelineEpisode } from "@/lib/journey/episodeTimeline";
import { ButtonSecondary } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/heading";
import { ROW } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format/duration";
import { SponsoredLabel } from "@/components/common/SponsoredLabel";

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
      {/* Da computer: titolo del Journey sopra la lista, invariato. Sul telefono il titolo del
       * Journey è già scritto accanto al numero episodio sopra il player (EpisodePlayer),
       * ripeterlo qui da solo stonava (segnalato da Manuel) — resta solo il conteggio totale. */}
      <SectionTitle className="hidden md:block">{journeyTitle}</SectionTitle>
      {/* Solo telefono: più grande e nello stesso stampatello arancione delle altre scritte
       * (Episode N, Journey...), invece del semplice testo di prima. Da computer invariato. */}
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-lg font-bold tracking-[0.18em] text-ember uppercase md:text-base md:font-normal md:tracking-normal md:normal-case">
          {episodes.length} {episodes.length === 1 ? "Episode" : "Episodes"}
        </p>
        <ButtonSecondary href={`/community/forum/${journeyId}`} className="shrink-0 py-1.5 md:hidden">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
          Forum
        </ButtonSecondary>
      </div>
      <ul className="mt-3 space-y-2 md:max-h-[70vh] md:overflow-y-auto md:pr-1">
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
                <span className="-mt-9 min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="shrink-0 text-sm font-bold tracking-[0.18em] text-ember uppercase md:font-normal">
                      Episode {episode.number}
                    </span>
                    {episode.durationSec !== null && (
                      <span className="shrink-0 text-sm text-ember">{formatDuration(episode.durationSec)}</span>
                    )}
                    {episode.progress && (
                      <span className="shrink-0 text-sm font-semibold text-ink-muted md:ml-4">
                        · {episode.progress.completedAt ? "Watched" : "Resume"}
                      </span>
                    )}
                  </span>
                  {/* Sul telefono la colonna è una sola: ripetere qui il titolo dell'episodio attivo
                   * duplicava quello già scritto grande sopra il player (non si nota da computer,
                   * dove questa lista sta in una colonna separata). Solo sul telefono, per la riga
                   * attiva, una scritta più corta al posto del titolo ripetuto. */}
                  <span
                    className={cn(
                      "mt-0.5 block truncate text-sm font-semibold transition-colors md:line-clamp-2 md:whitespace-normal",
                      active ? "text-ink max-md:hidden" : "group-hover:text-ember"
                    )}
                  >
                    {episode.title}
                  </span>
                  {active && (
                    <span className="mt-0.5 block text-sm font-semibold text-ember md:hidden">
                      Now playing
                    </span>
                  )}
                  {episode.isSponsored && <SponsoredLabel className="mt-1" />}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
