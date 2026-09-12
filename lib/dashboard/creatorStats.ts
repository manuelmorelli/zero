import { prisma } from "@/lib/prisma";
import type { JourneyPrivateStats } from "@/lib/dashboard/journeyStats";

/** Riepilogo "Private Stats" generale della Dashboard: stessi numeri di getJourneyPrivateStats
 * (lib/dashboard/journeyStats.ts), ma sommati su tutti i Journey del creator invece che su uno
 * solo. Include anche i Journey archiviati (il riepilogo generale è un bilancio complessivo del
 * lavoro del creator, non solo di ciò che è ancora attivo). */
export async function getCreatorPrivateStats(creatorId: string): Promise<JourneyPrivateStats> {
  const journeys = await prisma.journey.findMany({
    where: { creatorId, deletedAt: null },
    select: { id: true, viewsCount: true },
  });
  const views = journeys.reduce((sum, journey) => sum + journey.viewsCount, 0);
  const journeyIds = journeys.map((journey) => journey.id);
  if (journeyIds.length === 0) {
    return { views, completionRatePercent: null, completions: 0, interactions: 0 };
  }

  const episodes = await prisma.episode.findMany({
    where: { journeyId: { in: journeyIds }, deletedAt: null, publishedAt: { not: null } },
    select: { id: true, journeyId: true },
  });
  const episodeIds = episodes.map((episode) => episode.id);
  if (episodeIds.length === 0) {
    return { views, completionRatePercent: null, completions: 0, interactions: 0 };
  }

  const episodeToJourney = new Map(episodes.map((episode) => [episode.id, episode.journeyId]));
  const episodeCountByJourney = new Map<string, number>();
  for (const episode of episodes) {
    episodeCountByJourney.set(episode.journeyId, (episodeCountByJourney.get(episode.journeyId) ?? 0) + 1);
  }

  const [totalProgress, completedProgress, interactions, completedRows] = await Promise.all([
    prisma.episodeProgress.count({ where: { episodeId: { in: episodeIds } } }),
    prisma.episodeProgress.count({ where: { episodeId: { in: episodeIds }, completedAt: { not: null } } }),
    prisma.like.count({ where: { targetType: "EPISODE", targetId: { in: episodeIds } } }),
    prisma.episodeProgress.findMany({
      where: { episodeId: { in: episodeIds }, completedAt: { not: null } },
      select: { userId: true, episodeId: true },
    }),
  ]);

  // "Completamento vero" per Journey (stesso criterio di getJourneyPrivateStats): conta 1 solo
  // quando una persona ha finito TUTTI gli episodi pubblicati di QUEL Journey, sommato su tutti
  // i Journey (la stessa persona può contribuire più volte, per Journey diversi).
  const completedCountByUserJourney = new Map<string, number>();
  for (const row of completedRows) {
    const journeyId = episodeToJourney.get(row.episodeId);
    if (!journeyId) continue;
    const key = `${row.userId}:${journeyId}`;
    completedCountByUserJourney.set(key, (completedCountByUserJourney.get(key) ?? 0) + 1);
  }
  let completions = 0;
  for (const [key, count] of completedCountByUserJourney) {
    const journeyId = key.slice(key.indexOf(":") + 1);
    if (count === episodeCountByJourney.get(journeyId)) completions += 1;
  }

  const completionRatePercent = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : null;

  return { views, completionRatePercent, completions, interactions };
}
