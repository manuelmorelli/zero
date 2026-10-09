import { prisma } from "@/lib/prisma";
import { computeFreshJourneyScores } from "@/lib/scoring/journeyScore";
import { resolveAvatarUrl, resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import { isAlgorithmicRankingUnlocked } from "@/lib/discovery/algorithmUnlock";

export type TopJourneyItem = {
  id: string;
  title: string;
  coverUrl: string | null;
  category: string | null;
  creatorName: string;
  creatorAvatarUrl: string | null;
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
  // Le due domande qui sotto non dipendono l'una dall'altra: partono insieme invece che in fila.
  const [journeys, rankingUnlocked] = await Promise.all([
    prisma.journey.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      take: 50,
      orderBy: { publishedAt: "desc" },
      include: {
        creator: { include: { user: { select: { avatarUrl: true, _count: { select: { followers: true } } } } } },
        chapters: {
          where: { deletedAt: null },
          select: { _count: { select: { episodes: { where: { deletedAt: null, publishedAt: { not: null } } } } } },
        },
      },
    }),
    isAlgorithmicRankingUnlocked(),
  ]);

  // Punteggio calcolato subito in memoria per chi è scaduto, invece di salvarlo e rileggerlo dal
  // database: stesso valore che si otterrebbe rileggendo, senza il giro a vuoto.
  const freshScores = await computeFreshJourneyScores(
    journeys.map((journey) => ({
      id: journey.id,
      publishedAt: journey.publishedAt,
      journeyScore: journey.journeyScore,
      journeyScoreUpdatedAt: journey.journeyScoreUpdatedAt,
      followersCount: journey.creator.user._count.followers,
    }))
  );

  // Sotto ALGORITHMIC_RANKING_MIN_PUBLISHED_JOURNEYS il catalogo è troppo piccolo perché un
  // ranking per punteggio significhi qualcosa (vedi lib/discovery/algorithmUnlock.ts): si mostra
  // invece l'ordine cronologico, come "Discovering Now".
  const rankedJourneys = rankingUnlocked
    ? [...journeys].sort((a, b) => (freshScores.get(b.id) ?? 0) - (freshScores.get(a.id) ?? 0))
    : [...journeys].sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));

  const sorted = rankedJourneys.map((journey) => ({
    id: journey.id,
    title: journey.title,
    coverUrl: journey.coverUrl,
    category: journey.category,
    creatorName: journey.creator.displayName,
    creatorAvatarUrl: journey.creator.user.avatarUrl,
    followersCount: journey.creator.user._count.followers,
    episodesCount: journey.chapters.reduce((sum, chapter) => sum + chapter._count.episodes, 0),
    journeyScore: freshScores.get(journey.id) ?? journey.journeyScore,
  }));

  if (interests.length === 0) return resolveTopJourneyUrls(sorted.slice(0, limit));

  const interestSet = new Set(interests);
  const matching = sorted.filter((journey) => journey.category && interestSet.has(journey.category));
  const rest = sorted.filter((journey) => !(journey.category && interestSet.has(journey.category)));
  return resolveTopJourneyUrls([...matching, ...rest].slice(0, limit));
}

function resolveTopJourneyUrls(items: TopJourneyItem[]): Promise<TopJourneyItem[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      coverUrl: await resolveCoverUrl(item.coverUrl),
      creatorAvatarUrl: await resolveAvatarUrl(item.creatorAvatarUrl),
    }))
  );
}
