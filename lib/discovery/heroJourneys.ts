import { prisma } from "@/lib/prisma";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";
import { withResolvedCoverUrls } from "@/lib/media/resolveCoverUrl";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";

export type HeroJourneyItem = {
  id: string;
  title: string;
  coverUrl: string | null;
  category: string | null;
  creatorName: string;
};

/**
 * Journey reali da mostrare a rotazione nella Hero della Home, al posto delle 4 foto demo fisse
 * (lib/demo/heroSlides.ts). Stesso criterio di "Top Journeys" (Journey Score, 08_Algorithm.md),
 * ma senza escludere la Discovery Phase — qui non c'è sovrapposizione con "Discovering Now" — e
 * solo tra i Journey con una foto di copertina reale, altrimenti la Hero non avrebbe una foto da
 * mostrare.
 */
export async function getHeroJourneys(limit = 4): Promise<HeroJourneyItem[]> {
  const candidates = await prisma.journey.findMany({
    where: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null, coverUrl: { not: null } },
    select: { id: true },
    take: 50,
  });
  if (candidates.length === 0) return [];

  await ensureFreshJourneyScores(candidates.map((journey) => journey.id));

  const journeys = await prisma.journey.findMany({
    where: { id: { in: candidates.map((journey) => journey.id) } },
    include: { creator: true },
  });

  const sorted = journeys
    .sort((a, b) => b.journeyScore - a.journeyScore)
    .slice(0, limit)
    .map((journey) => ({
      id: journey.id,
      title: journey.title,
      coverUrl: journey.coverUrl,
      category: journey.category,
      creatorName: journey.creator.displayName,
    }));

  return withResolvedCoverUrls(sorted);
}
