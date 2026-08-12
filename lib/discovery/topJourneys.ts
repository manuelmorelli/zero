import { prisma } from "@/lib/prisma";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";

export type TopJourneyItem = {
  id: string;
  title: string;
  coverUrl: string | null;
  category: string | null;
  creatorName: string;
  followersCount: number;
  episodesCount: number;
};

/**
 * Journey pubblicati con il Journey Score più alto (08_Algorithm.md, "Journey Score") — non più
 * ordinati per follower: è la sezione "Long-Term Value" dell'algoritmo, dove il completamento e la
 * continuità contano più della scala del creator. Solo i Journey già usciti dalla Discovery Phase
 * partecipano (status PUBLISHED): quelli in DISCOVERY sono già garantiti da "Discovering Now".
 * Se l'utente ha dichiarato interessi, quelli nelle sue categorie vengono mostrati per primi,
 * mantenendo comunque l'ordinamento per punteggio dentro ciascun gruppo.
 */
export async function getTopJourneys({
  limit = 10,
  interests = [],
}: { limit?: number; interests?: string[] } = {}): Promise<TopJourneyItem[]> {
  const candidateIds = await prisma.journey.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    select: { id: true },
    take: 50,
    orderBy: { publishedAt: "desc" },
  });
  await ensureFreshJourneyScores(candidateIds.map((journey) => journey.id));

  const journeys = await prisma.journey.findMany({
    where: { id: { in: candidateIds.map((journey) => journey.id) } },
    include: {
      creator: { include: { user: { include: { _count: { select: { followers: true } } } } } },
      chapters: {
        where: { deletedAt: null },
        select: { _count: { select: { episodes: { where: { deletedAt: null } } } } },
      },
    },
  });

  const sorted = journeys
    .map((journey) => ({
      id: journey.id,
      title: journey.title,
      coverUrl: journey.coverUrl,
      category: journey.category,
      creatorName: journey.creator.displayName,
      followersCount: journey.creator.user._count.followers,
      episodesCount: journey.chapters.reduce((sum, chapter) => sum + chapter._count.episodes, 0),
      journeyScore: journey.journeyScore,
    }))
    .sort((a, b) => b.journeyScore - a.journeyScore);

  const withoutScore = sorted.map(({ journeyScore: _journeyScore, ...journey }) => journey);

  if (interests.length === 0) return withoutScore.slice(0, limit);

  const interestSet = new Set(interests);
  const matching = withoutScore.filter((journey) => journey.category && interestSet.has(journey.category));
  const rest = withoutScore.filter((journey) => !(journey.category && interestSet.has(journey.category)));
  return [...matching, ...rest].slice(0, limit);
}
