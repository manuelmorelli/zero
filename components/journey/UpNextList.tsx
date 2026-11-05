import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import type { TimelineEpisode } from "@/lib/journey/episodeTimeline";
import { ButtonSecondary } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/heading";
import { ROW } from "@/components/ui/panel";
import { CoverMenu } from "@/components/journey/CoverMenu";
import { ExpandableText } from "@/components/common/ExpandableText";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format/duration";
import { SponsoredLabel } from "@/components/common/SponsoredLabel";

type UpNextListProps = {
  journeyId: string;
  journeyTitle: string;
  coverUrl: string | null;
  episodes: TimelineEpisode[];
  activeEpisodeId: string;
  isOwnContent: boolean;
  isLoggedIn: boolean;
};

/** Sidebar "Up next" della pagina Player: tutti gli episodi del Journey, quello attivo evidenziato. */
export function UpNextList({ journeyId, journeyTitle, coverUrl, episodes, activeEpisodeId, isOwnContent, isLoggedIn }: UpNextListProps) {
  return (
    <aside className="min-w-0 md:-translate-x-9">
      {/* Da computer: titolo del Journey sopra la lista, invariato. Sul telefono il titolo del
       * Journey è già scritto accanto al numero episodio sopra il player (EpisodePlayer),
       * ripeterlo qui da solo stonava (segnalato da Manuel) — resta solo il conteggio totale. */}
      <SectionTitle className="hidden md:block">{journeyTitle}</SectionTitle>
      {/* Stesso stampatello arancione grande delle altre scritte (Episode N, Journey...), ora
       * identico su computer e telefono (prima da computer era piccolo e senza maiuscolo). */}
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-lg font-bold tracking-[0.18em] text-ember uppercase">
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
          const episodeHref = `/journeys/${journeyId}/episodes/${episode.id}`;
          return (
            <li key={episode.id}>
              <div className={cn(ROW, "group flex items-start gap-3", active ? "border-ember-line bg-ember-soft" : "bg-transparent")}>
                {/* Copertina piccola in un riquadro a parte (stessa proporzione 112/156 usata per
                 * le copertine episodio in tutto il sito, non più un riquadro 4:3 fatto a mano):
                 * quello vecchio schiacciava le foto più alte che larghe, tagliandole male (es.
                 * "Walk" si vedeva a metà). Link separato dal titolo solo per poter mettere il
                 * menu a tre puntini qui sopra, fuori da un <a> (un bottone non può starci dentro). */}
                <div className="group/thumb relative aspect-[112/156] w-28 shrink-0">
                  <Link href={episodeHref} className="absolute inset-0 block overflow-hidden rounded-lg border border-border bg-surface-2">
                    {episode.posterUrl || coverUrl ? (
                      <Image src={episode.posterUrl || coverUrl!} alt="" fill sizes="112px" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 cover-placeholder" />
                    )}
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
                  </Link>
                  {/* Fuori dal Link: il tocco su "more" deve aprire la caption, non andare
                   * all'episodio (un bottone non può stare dentro un <a>). */}
                  {episode.caption && (
                    <ExpandableText text={episode.caption} clampLines={2} className="mt-4 text-sm text-ink-muted" />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
