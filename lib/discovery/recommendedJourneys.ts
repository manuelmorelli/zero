import { prisma } from "@/lib/prisma";
import type { JourneyCardData } from "@/components/journey/JourneyCard";
import { getFollowedCreatorIds, getOwnCreatorId, getFollowedCategories } from "@/lib/discovery/follows";

type JourneyWithCreator = Awaited<ReturnType<typeof findPublishedJourneys>>[number];

type GetRecommendedJourneysParams = {
  /** null se l'utente non è loggato: si ricade sempre sul criterio di popolarità. */
  userId: string | null;
  /** Journey da non riproporre perché già mostrati altrove nella Home (es. Continue Your Journey). */
  excludeJourneyIds?: string[];
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
  limit = 5,
}: GetRecommendedJourneysParams): Promise<JourneyCardData[]> {
  const followedCreatorIds = userId ? await getFollowedCreatorIds(userId) : [];
  const ownCreatorId = userId ? await getOwnCreatorId(userId) : null;

  const excludedCreatorIds = ownCreatorId
    ? [...followedCreatorIds, ownCreatorId]
    : followedCreatorIds;

  const selected: JourneyWithCreator[] = [];
  const selectedIds = new Set<string>();

  const followedCategories = followedCreatorIds.length > 0
    ? await getFollowedCategories(followedCreatorIds)
    : [];

  if (followedCategories.length > 0) {
    const categoryMatches = await findPublishedJourneys({
      excludedCreatorIds,
      excludedJourneyIds: excludeJourneyIds,
      categories: followedCategories,
    });
    for (const journey of sortByFollowersDesc(categoryMatches)) {
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
    for (const journey of sortByFollowersDesc(popular)) {
      if (selected.length >= limit) break;
      selected.push(journey);
    }
  }

  return selected.map(toJourneyCardData);
}

async function findPublishedJourneys(filters: {
  excludedCreatorIds: string[];
  excludedJourneyIds: string[] | Set<string>;
  categories?: string[];
}) {
  return prisma.journey.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      creatorId: { notIn: filters.excludedCreatorIds },
      id: { notIn: [...filters.excludedJourneyIds] },
      ...(filters.categories ? { category: { in: filters.categories } } : {}),
    },
    include: { creator: { include: { _count: { select: { followers: true } } } } },
  });
}

function sortByFollowersDesc(journeys: JourneyWithCreator[]): JourneyWithCreator[] {
  return [...journeys].sort((a, b) => b.creator._count.followers - a.creator._count.followers);
}

function toJourneyCardData(journey: JourneyWithCreator): JourneyCardData {
  return {
    id: journey.id,
    title: journey.title,
    coverUrl: journey.coverUrl,
    category: journey.category,
    creator: { displayName: journey.creator.displayName },
    followersCount: journey.creator._count.followers,
  };
}
