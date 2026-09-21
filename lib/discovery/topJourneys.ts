import { prisma } from "@/lib/prisma";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";
import { withResolvedCoverUrls } from "@/lib/media/resolveCoverUrl";
import { isAlgorithmicRankingUnlocked } from "@/lib/discovery/algorithmUnlock";

export type TopJourneyItem = {
  id: string;
  title: string;
  coverUrl: string | null;
  category: string | null;
  creatorName: string;
  followersCount: number;
  episodesCount: number;
  /** Journey Score (0-100, lib/scoring/journeyScore.ts): qui sempre presente, solo Journey
   * PUBLISHED partecipano a questa sezione. */
  journeyScore: number;
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
  const rankingUnlocked = await isAlgorithmicRankingUnlocked();

  const journeys = await prisma.journey.findMany({
    where: { id: { in: candidateIds.map((journey) => journey.id) } },
    include: {
      creator: { include: { user: { include: { _count: { select: { followers: true } } } } } },
      chapters: {
        where: { deletedAt: null },
        select: { _count: { select: { episodes: { where: { deletedAt: null, publishedAt: { not: null } } } } } },
      },
    },
  });

  // Sotto ALGORITHMIC_RANKING_MIN_PUBLISHED_JOURNEYS il catalogo è troppo piccolo perché un
  // ranking per punteggio significhi qualcosa (vedi lib/discovery/algorithmUnlock.ts): si mostra
  // invece l'ordine cronologico, come "Discovering Now".
  const rankedJourneys = rankingUnlocked
    ? [...journeys].sort((a, b) => b.journeyScore - a.journeyScore)
    : [...journeys].sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));

  const sorted = rankedJourneys.map((journey) => ({
    id: journey.id,
    title: journey.title,
    coverUrl: journey.coverUrl,
    category: journey.category,
    creatorName: journey.creator.displayName,
    followersCount: journey.creator.user._count.followers,
    episodesCount: journey.chapters.reduce((sum, chapter) => sum + chapter._count.episodes, 0),
    journeyScore: journey.journeyScore,
  }));

  if (interests.length === 0) return withResolvedCoverUrls(sorted.slice(0, limit));

  const interestSet = new Set(interests);
  const matching = sorted.filter((journey) => journey.category && interestSet.has(journey.category));
  const rest = sorted.filter((journey) => !(journey.category && interestSet.has(journey.category)));
  return withResolvedCoverUrls([...matching, ...rest].slice(0, limit));
}
