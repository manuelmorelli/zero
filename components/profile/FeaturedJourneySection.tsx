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
};

// Il Journey "in evidenza": tra i Journey pubblicati del creator, quello che ha ricevuto
// l'episodio più recente (vedi lib/profile/featuredJourney.ts). Con un solo Journey pubblicato
// coincide semplicemente con quello. Stesso CoverFrame (format "journey") di JourneyCard, per
// restare sempre alle stesse misure del resto del sito.
export function FeaturedJourneySection({ journey, episodeCount }: FeaturedJourneySectionProps) {
  return (
    <CoverFrame
      format="journey"
      href={`/journeys/${journey.id}`}
      imageUrl={journey.coverUrl}
      imageAlt={journey.title}
      className="self-start max-md:w-full md:w-[calc((100%-2rem)/2)] md:shrink-0 lg:w-[calc((100%-4rem)/3)]"
      topLeft={
        <CoverChip className="bg-overlay-soft uppercase tracking-wider max-md:px-2 max-md:py-0.5">
          In Progress
        </CoverChip>
      }
      overlay={
        <>
          {journey.category && (
            <CoverChip className="-ml-2 mt-2 px-2 py-0.5 bg-overlay-soft uppercase tracking-wider max-md:px-2 max-md:py-0.5 max-md:normal-case max-md:tracking-normal">
              {journey.category}
            </CoverChip>
          )}
          <CoverTitle>{journey.title}</CoverTitle>
          {episodeCount !== undefined && (
            <p className="mt-1 text-sm">
              {episodeCount} {episodeCount === 1 ? "episode" : "episodes"}
            </p>
          )}
        </>
      }
    />
  );
}
