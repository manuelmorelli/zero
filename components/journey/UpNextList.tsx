import { MessageSquare } from "lucide-react";
import type { TimelineEpisode } from "@/lib/journey/episodeTimeline";
import { ButtonSecondary } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/heading";
import { EpisodeRow } from "@/components/journey/EpisodeRow";

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
        {episodes.map((episode) => (
          <EpisodeRow
            key={episode.id}
            episode={episode}
            journeyId={journeyId}
            coverUrl={coverUrl}
            isOwnContent={isOwnContent}
            isLoggedIn={isLoggedIn}
            active={episode.id === activeEpisodeId}
          />
        ))}
      </ul>
    </aside>
  );
}
