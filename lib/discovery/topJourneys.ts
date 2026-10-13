import { prisma } from "@/lib/prisma";
import { computeFreshJourneyScores } from "@/lib/scoring/journeyScore";
import { resolveAvatarUrl, resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import { getPublishedEpisodeCounts } from "@/lib/journey/episodeCounts";
import { isAlgorithmicRankingUnlocked } from "@/lib/discovery/algorithmUnlock";

/** Quanti candidati valutare per gruppo: ben più dei posti mostrati, così un punteggio salvato
 * da poco superato (ricalcolo ogni 24 ore) non tiene fuori nessuno. */
const TOP_CANDIDATES = 50;

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
  const rankingUnlocked = await isAlgorithmicRankingUnlocked();

  // I candidati sono i migliori per punteggio già salvato (o i più recenti, prima dello sblocco),
  // non più i 50 pubblicati più di recente: un Journey vecchio ma ottimo, anche finito, resta in
  // gara. Con interessi dichiarati si prendono a parte anche i migliori di quelle categorie, che
  // altrimenti potrebbero restare fuori dal gruppo generale.
  const findCandidates = (categories?: string[]) =>
    prisma.journey.findMany({
      where: { status: "PUBLISHED", deletedAt: null, ...(categories ? { category: { in: categories } } : {}) },
      take: TOP_CANDIDATES,
      orderBy: rankingUnlocked ? [{ journeyScore: "desc" }, { publishedAt: "desc" }] : { publishedAt: "desc" },
      include: {
        creator: { include: { user: { select: { avatarUrl: true, _count: { select: { followers: true } } } } } },
      },
    });
  const [general, interestMatches] = await Promise.all([
    findCandidates(),
    interests.length > 0 ? findCandidates(interests) : Promise.resolve([]),
  ]);
  const journeys = [...new Map([...interestMatches, ...general].map((journey) => [journey.id, journey])).values()];

  // Punteggio calcolato subito in memoria per chi è scaduto, invece di salvarlo e rileggerlo dal
  // database: stesso valore che si otterrebbe rileggendo, senza il giro a vuoto.
  const freshScores = await computeFreshJourneyScores(
    journeys.map((journey) => ({
      id: journey.id,
      publishedAt: journey.publishedAt,
      completedAt: journey.completedAt,
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

  const episodeCounts = await getPublishedEpisodeCounts(rankedJourneys.map((journey) => journey.id));
  const sorted = rankedJourneys.map((journey) => ({
    id: journey.id,
    title: journey.title,
    coverUrl: journey.coverUrl,
    category: journey.category,
    creatorName: journey.creator.displayName,
    creatorAvatarUrl: journey.creator.user.avatarUrl,
    followersCount: journey.creator.user._count.followers,
    episodesCount: episodeCounts.get(journey.id) ?? 0,
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
