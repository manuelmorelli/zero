import { prisma } from "@/lib/prisma";

export type LatestVideoItem = {
  episodeId: string;
  journeyId: string;
  title: string;
  coverUrl: string | null;
  creatorName: string;
  createdAt: Date;
};

/**
 * Ultimi episodi con un video caricato, pubblicati su tutta la piattaforma
 * (non filtrati per creator seguiti — è la riga "Latest Videos" della Home, non il Feed).
 */
export async function getLatestVideos({ limit = 10 }: { limit?: number } = {}): Promise<LatestVideoItem[]> {
  const episodes = await prisma.episode.findMany({
    where: {
      videoKey: { not: null },
      deletedAt: null,
      chapter: {
        deletedAt: null,
        journey: { status: "PUBLISHED", deletedAt: null },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      chapter: {
        include: {
          journey: { include: { creator: true } },
        },
      },
    },
  });

  return episodes.map((episode) => ({
    episodeId: episode.id,
    journeyId: episode.chapter.journey.id,
    title: episode.title,
    coverUrl: episode.chapter.journey.coverUrl,
    creatorName: episode.chapter.journey.creator.displayName,
    createdAt: episode.createdAt,
  }));
}
