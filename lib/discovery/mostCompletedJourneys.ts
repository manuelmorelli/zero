import { prisma } from "@/lib/prisma";
import { computeViewerStatsByJourney, MIN_SAMPLE_SIZE } from "@/lib/scoring/journeyScore";
import { withResolvedJourneyCardUrls } from "@/lib/media/resolveCoverUrl";
import type { JourneyCardData } from "@/components/journey/JourneyCard";

/**
 * Journey pubblicati ordinati per quota di spettatori che li hanno finiti (≥90% degli episodi,
 * stesso criterio di "completamento" di `lib/scoring/journeyScore.ts`), non per il punteggio misto
 * di Top Journeys. Solo `/journeys` la mostra (`94_Product_Backlog.md`), mai in Home. Un Journey
 * entra in classifica solo con almeno `MIN_SAMPLE_SIZE` spettatori distinti: sotto soglia la riga
 * semplicemente non lo include (mai una percentuale mostrata, coerente con journeyScore.ts).
 */
export async function getMostCompletedJourneys(limit = 10): Promise<JourneyCardData[]> {
  const candidates = await prisma.journey.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    select: {
      id: true,
      title: true,
      coverUrl: true,
      category: true,
      creator: { select: { displayName: true, user: { select: { avatarUrl: true } } } },
    },
  });
  if (candidates.length === 0) return [];

  const { episodesByJourney, viewerStatsByJourney } = await computeViewerStatsByJourney(
    candidates.map((journey) => journey.id)
  );

  const ranked = candidates
    .map((journey) => {
      const totalEpisodes = episodesByJourney.get(journey.id)?.length ?? 0;
      const viewers = [...(viewerStatsByJourney.get(journey.id)?.values() ?? [])];
      if (totalEpisodes === 0 || viewers.length < MIN_SAMPLE_SIZE) return null;

      const completionShare =
        viewers.filter((viewer) => viewer.completed / totalEpisodes >= 0.9).length / viewers.length;
      return { journey, completionShare };
    })
    .filter((entry): entry is { journey: (typeof candidates)[number]; completionShare: number } => entry !== null)
    .sort((a, b) => b.completionShare - a.completionShare)
    .slice(0, limit)
    .map(({ journey }) => ({
      id: journey.id,
      title: journey.title,
      coverUrl: journey.coverUrl,
      category: journey.category,
      creator: { displayName: journey.creator.displayName, avatarUrl: journey.creator.user.avatarUrl },
    }));

  return withResolvedJourneyCardUrls(ranked);
}
