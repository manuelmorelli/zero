import { CardInfoRow } from "@/components/journey/CardInfoRow";
import { cn } from "@/lib/utils";
import { CoverChip, CoverFrame, CoverTitle } from "@/components/ui/cover-card";

type FeaturedJourneySectionProps = {
  journey: {
    id: string;
    title: string;
    coverUrl: string | null;
    category: string | null;
    journeyScore: number;
    status: string;
  };
  episodeCount?: number;
  /** Proprietario del profilo: da computer foto e nome stanno sotto la foto con il titolo, come
   * nelle card della Home. */
  creator?: { userId: string; name: string; avatarUrl?: string | null };
  /** Dentro la griglia dei Journey pubblicati (computer): riempie la sua cella invece della
   * larghezza fissa pensata per la riga dell'Overview. */
  inGrid?: boolean;
};

// Il Journey "in evidenza": tra i Journey pubblicati del creator, quello che ha ricevuto
// l'episodio più recente (vedi lib/profile/featuredJourney.ts). Con un solo Journey pubblicato
// coincide semplicemente con quello. Stesso CoverFrame (format "journey") di JourneyCard, per
// restare sempre alle stesse misure del resto del sito.
export function FeaturedJourneySection({ journey, episodeCount, creator, inGrid = false }: FeaturedJourneySectionProps) {
  return (
    <CoverFrame
      format="journey"
      href={`/journeys/${journey.id}`}
      imageUrl={journey.coverUrl}
      imageAlt={journey.title}
      className={
        inGrid
          ? "w-full"
          : "self-start max-md:w-full md:w-[calc((100%-2rem)/2)] md:shrink-0 lg:w-[calc((100%-4rem)/3)]"
      }
      topLeft={
        <CoverChip className="bg-overlay-soft uppercase tracking-wider max-md:px-2 max-md:py-0.5">
          In Progress
        </CoverChip>
      }
      overlayClassName="max-md:p-1.5"
      belowClassName={creator ? "max-md:hidden" : "hidden"}
      below={
        creator ? (
          <CardInfoRow title={journey.title} episodeCount={episodeCount} creator={creator} score={journey.journeyScore > 0 ? Math.round(journey.journeyScore) : undefined} />
        ) : undefined
      }
      overlay={
        <>
          {journey.category && (
            <CoverChip className="-ml-1 mt-0.5 bg-overlay-soft px-2 py-0.5 normal-case tracking-normal md:-ml-2 md:-mb-2.5 md:mt-0 md:block md:w-fit md:bg-scrim">
              {journey.category}
            </CoverChip>
          )}
          <CoverTitle className={cn("max-md:mt-0", creator && "md:hidden")}>{journey.title}</CoverTitle>
          {episodeCount !== undefined && (
            <p className={cn("mt-1 text-sm max-md:mt-0", creator && "md:hidden")}>
              {episodeCount} {episodeCount === 1 ? "episode" : "episodes"}
            </p>
          )}
        </>
      }
    />
  );
}
