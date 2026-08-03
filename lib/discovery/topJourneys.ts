import { prisma } from "@/lib/prisma";

export type TopJourneyItem = {
  id: string;
  title: string;
  coverUrl: string | null;
  category: string | null;
  creatorName: string;
  followersCount: number;
  episodesCount: number;
};

/** Journey pubblicati più seguiti (per numero di follower del creator), non un vero "trust score". */
export async function getTopJourneys({ limit = 10 }: { limit?: number } = {}): Promise<TopJourneyItem[]> {
  const journeys = await prisma.journey.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    take: 50,
    orderBy: { publishedAt: "desc" },
    include: {
      creator: { include: { _count: { select: { followers: true } } } },
      chapters: {
        where: { deletedAt: null },
        select: { _count: { select: { episodes: { where: { deletedAt: null } } } } },
      },
    },
  });

  return journeys
    .map((journey) => ({
      id: journey.id,
      title: journey.title,
      coverUrl: journey.coverUrl,
      category: journey.category,
      creatorName: journey.creator.displayName,
      followersCount: journey.creator._count.followers,
      episodesCount: journey.chapters.reduce((sum, chapter) => sum + chapter._count.episodes, 0),
    }))
    .sort((a, b) => b.followersCount - a.followersCount)
    .slice(0, limit);
}
