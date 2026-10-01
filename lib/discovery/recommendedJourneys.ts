import { prisma } from "@/lib/prisma";
import type { JourneyCardData } from "@/components/journey/JourneyCard";
import { getFollowedCreatorIds, getOwnCreatorId, getFollowedCategories } from "@/lib/discovery/follows";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";
import { withResolvedJourneyCardUrls } from "@/lib/media/resolveCoverUrl";
import { isAlgorithmicRankingUnlocked } from "@/lib/discovery/algorithmUnlock";

type JourneyWithCreator = Awaited<ReturnType<typeof findPublishedJourneys>>[number];

type GetRecommendedJourneysParams = {
  /** null se l'utente non è loggato: si ricade sempre sul criterio di popolarità. */
  userId: string | null;
  /** Journey da non riproporre perché già mostrati altrove nella Home (es. Continue Your Journey). */
  excludeJourneyIds?: string[];
  /** Interessi dichiarati dall'utente (Onboarding/Profilo), si sommano alle categorie dei creator seguiti. */
  interests?: string[];
  limit?: number;
};

/**
 * Criterio attuale (semplice, non un algoritmo di raccomandazione vero e proprio):
 * 1. categorie dei creator seguiti dall'utente → altri Journey pubblicati nelle stesse categorie,
 *    di creator non ancora seguiti, ordinati per numero di follower del creator;
 * 2. se non bastano (o l'utente non segue nessuno / non è loggato), si completa con i Journey
 *    pubblicati più popolari rimasti, sempre escludendo creator già seguiti e Journey già scelti.
 * La sezione va nascosta dal chiamante se il risultato è vuoto.
 *
 * Punto di estensione futuro: sostituire il corpo di questa funzione con un criterio più evoluto
 * senza toccare la Home, che si limita a passare userId + Journey da escludere e a renderizzare il risultato.
 */
export async function getRecommendedJourneys({
  userId,
  excludeJourneyIds = [],
  interests = [],
  limit = 5,
}: GetRecommendedJourneysParams): Promise<JourneyCardData[]> {
  const followedCreatorIds = userId ? await getFollowedCreatorIds(userId) : [];
  const ownCreatorId = userId ? await getOwnCreatorId(userId) : null;

  const excludedCreatorIds = ownCreatorId
    ? [...followedCreatorIds, ownCreatorId]
    : followedCreatorIds;

  const selected: JourneyWithCreator[] = [];
  const selectedIds = new Set<string>();
  const rankingUnlocked = await isAlgorithmicRankingUnlocked();

  const followedCategories = followedCreatorIds.length > 0
    ? await getFollowedCategories(followedCreatorIds)
    : [];
  const candidateCategories = Array.from(new Set([...followedCategories, ...interests]));

  if (candidateCategories.length > 0) {
    const categoryMatches = await findPublishedJourneys({
      excludedCreatorIds,
      excludedJourneyIds: excludeJourneyIds,
      categories: candidateCategories,
    });
    for (const journey of sortJourneys(categoryMatches, rankingUnlocked)) {
      if (selected.length >= limit) break;
      selected.push(journey);
      selectedIds.add(journey.id);
    }
  }

  if (selected.length < limit) {
    const popular = await findPublishedJourneys({
      excludedCreatorIds,
      excludedJourneyIds: [...excludeJourneyIds, ...selectedIds],
    });
    for (const journey of sortJourneys(popular, rankingUnlocked)) {
      if (selected.length >= limit) break;
      selected.push(journey);
    }
  }

  return withResolvedJourneyCardUrls(selected.map(toJourneyCardData));
}

async function findPublishedJourneys(filters: {
  excludedCreatorIds: string[];
  excludedJourneyIds: string[] | Set<string>;
  categories?: string[];
}) {
  const where = {
    status: "PUBLISHED" as const,
    deletedAt: null,
    creatorId: { notIn: filters.excludedCreatorIds },
    id: { notIn: [...filters.excludedJourneyIds] },
    ...(filters.categories ? { category: { in: filters.categories } } : {}),
  };

  const candidateIds = await prisma.journey.findMany({ where, select: { id: true } });
  await ensureFreshJourneyScores(candidateIds.map((journey) => journey.id));

  return prisma.journey.findMany({
    where,
    include: { creator: { include: { user: { select: { avatarUrl: true, _count: { select: { followers: true } } } } } } },
  });
}

// "Spinta extra" del Journey Score (08_Algorithm.md): dentro il gruppo già selezionato per
// categoria/popolarità (la garanzia di base non cambia), l'ordine finale non premia più solo i
// follower ma il punteggio reale — completamento, continuità ed engagement pesano di più.
// Sotto ALGORITHMIC_RANKING_MIN_PUBLISHED_JOURNEYS (lib/discovery/algorithmUnlock.ts) il catalogo
// è troppo piccolo perché quel punteggio significhi qualcosa: si ordina per data invece.
function sortJourneys(journeys: JourneyWithCreator[], rankingUnlocked: boolean): JourneyWithCreator[] {
  return [...journeys].sort((a, b) =>
    rankingUnlocked
      ? b.journeyScore - a.journeyScore
      : (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
  );
}

function toJourneyCardData(journey: JourneyWithCreator): JourneyCardData {
  return {
    id: journey.id,
    title: journey.title,
    description: journey.description,
    coverUrl: journey.coverUrl,
    category: journey.category,
    journeyScore: journey.journeyScore,
    creator: { displayName: journey.creator.displayName, avatarUrl: journey.creator.user.avatarUrl },
  };
}
