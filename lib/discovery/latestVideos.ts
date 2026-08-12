import { prisma } from "@/lib/prisma";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";

export type LatestVideoItem = {
  episodeId: string;
  journeyId: string;
  title: string;
  coverUrl: string | null;
  category: string | null;
  creatorName: string;
  createdAt: Date;
};

/**
 * Ultimi episodi con un video caricato, pubblicati su tutta la piattaforma
 * (non filtrati per creator seguiti — è la riga "Latest Videos" della Home, non il Feed).
 * Se l'utente ha dichiarato interessi, quelli nelle sue categorie vengono mostrati per primi,
 * mantenendo comunque l'ordine dal più recente al meno recente dentro ciascun gruppo.
 */
export async function getLatestVideos({
  limit = 10,
  interests = [],
}: { limit?: number; interests?: string[] } = {}): Promise<LatestVideoItem[]> {
  const pool = interests.length > 0 ? Math.max(limit * 4, 20) : limit;

  const episodes = await prisma.episode.findMany({
    where: {
      videoKey: { not: null },
      deletedAt: null,
      OR: [{ chapterId: null }, { chapter: { deletedAt: null } }],
      journey: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null },
    },
    orderBy: { createdAt: "desc" },
    take: pool,
    include: {
      journey: { include: { creator: true } },
    },
  });

  const ordered = interests.length === 0
    ? episodes
    : (() => {
        const interestSet = new Set(interests);
        const matching = episodes.filter((episode) => episode.journey.category && interestSet.has(episode.journey.category));
        const rest = episodes.filter((episode) => !(episode.journey.category && interestSet.has(episode.journey.category)));
        return [...matching, ...rest];
      })();

  return ordered.slice(0, limit).map((episode) => ({
    episodeId: episode.id,
    journeyId: episode.journey.id,
    title: episode.title,
    coverUrl: episode.journey.coverUrl,
    category: episode.journey.category,
    creatorName: episode.journey.creator.displayName,
    createdAt: episode.createdAt,
  }));
}
