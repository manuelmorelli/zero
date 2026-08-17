import { prisma } from "@/lib/prisma";

export type JourneyPrivateStats = {
  views: number;
  /** Percentuale di episodi iniziati che sono stati portati a termine. Null = nessun dato ancora. */
  completionRatePercent: number | null;
  /** Persone che hanno finito TUTTI gli episodi pubblicati del Journey (non solo l'ultimo). */
  completions: number;
  /** Like sugli episodi del Journey. */
  interactions: number;
};

/** Pannello "Private Stats" della Dashboard (visibile solo al creator, mai sul profilo pubblico):
 * numeri reali calcolati al volo da EpisodeProgress/Like, nessun dato finto o storico simulato. */
export async function getJourneyPrivateStats(
  journeyId: string,
  viewsCount: number
): Promise<JourneyPrivateStats> {
  const episodes = await prisma.episode.findMany({
    where: { journeyId, deletedAt: null, publishedAt: { not: null } },
    select: { id: true },
  });
  const episodeIds = episodes.map((episode) => episode.id);

  if (episodeIds.length === 0) {
    return { views: viewsCount, completionRatePercent: null, completions: 0, interactions: 0 };
  }

  const [totalProgress, completedProgress, interactions, completionsPerUser] = await Promise.all([
    prisma.episodeProgress.count({ where: { episodeId: { in: episodeIds } } }),
    prisma.episodeProgress.count({ where: { episodeId: { in: episodeIds }, completedAt: { not: null } } }),
    prisma.like.count({ where: { targetType: "EPISODE", targetId: { in: episodeIds } } }),
    prisma.episodeProgress.groupBy({
      by: ["userId"],
      where: { episodeId: { in: episodeIds }, completedAt: { not: null } },
      _count: { _all: true },
    }),
  ]);

  // "Completamento vero": solo chi ha finito ogni episodio pubblicato, non solo l'ultimo visto.
  const completions = completionsPerUser.filter((user) => user._count._all === episodeIds.length).length;
  const completionRatePercent = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : null;

  return { views: viewsCount, completionRatePercent, completions, interactions };
}
