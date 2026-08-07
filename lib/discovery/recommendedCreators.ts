import { prisma } from "@/lib/prisma";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";
import { getFollowedCreatorIds, getOwnCreatorId, getFollowedCategories } from "@/lib/discovery/follows";

type CreatorWithUser = Awaited<ReturnType<typeof findPublishedCreators>>[number];

type GetRecommendedCreatorsParams = {
  /** null se l'utente non è loggato: si ricade sempre sul criterio di popolarità. */
  userId: string | null;
  /** Interessi dichiarati dall'utente (Onboarding/Profilo), si sommano alle categorie dei creator seguiti. */
  interests?: string[];
  limit?: number;
};

/**
 * Stesso criterio di getRecommendedJourneys (lib/discovery/recommendedJourneys.ts),
 * applicato ai creator invece che ai singoli Journey:
 * 1. creator non ancora seguiti che pubblicano nelle categorie già seguite dall'utente,
 *    ordinati per numero di follower;
 * 2. se non bastano (o l'utente non segue nessuno / non è loggato), si completa con i
 *    creator più seguiti rimasti, sempre escludendo se stesso e i creator già seguiti.
 * La sezione va nascosta dal chiamante se il risultato è vuoto.
 */
export async function getRecommendedCreators({
  userId,
  interests = [],
  limit = 5,
}: GetRecommendedCreatorsParams): Promise<CreatorSearchResult[]> {
  const followedCreatorIds = userId ? await getFollowedCreatorIds(userId) : [];
  const ownCreatorId = userId ? await getOwnCreatorId(userId) : null;

  const excludedCreatorIds = ownCreatorId
    ? [...followedCreatorIds, ownCreatorId]
    : followedCreatorIds;

  const selected: CreatorWithUser[] = [];
  const selectedIds = new Set<string>();

  const followedCategories = followedCreatorIds.length > 0
    ? await getFollowedCategories(followedCreatorIds)
    : [];
  const candidateCategories = Array.from(new Set([...followedCategories, ...interests]));

  if (candidateCategories.length > 0) {
    const categoryMatches = await findPublishedCreators({
      excludedCreatorIds,
      categories: candidateCategories,
    });
    for (const creator of sortByFollowersDesc(categoryMatches)) {
      if (selected.length >= limit) break;
      selected.push(creator);
      selectedIds.add(creator.id);
    }
  }

  if (selected.length < limit) {
    const popular = await findPublishedCreators({
      excludedCreatorIds: [...excludedCreatorIds, ...selectedIds],
    });
    for (const creator of sortByFollowersDesc(popular)) {
      if (selected.length >= limit) break;
      selected.push(creator);
    }
  }

  return selected.map(toCreatorSearchResult);
}

async function findPublishedCreators(filters: {
  excludedCreatorIds: string[] | Set<string>;
  categories?: string[];
}) {
  return prisma.creator.findMany({
    where: {
      deletedAt: null,
      id: { notIn: [...filters.excludedCreatorIds] },
      journeys: {
        some: {
          status: "PUBLISHED",
          deletedAt: null,
          ...(filters.categories ? { category: { in: filters.categories } } : {}),
        },
      },
    },
    include: { user: true, _count: { select: { followers: true } } },
  });
}

function sortByFollowersDesc(creators: CreatorWithUser[]): CreatorWithUser[] {
  return [...creators].sort((a, b) => b._count.followers - a._count.followers);
}

function toCreatorSearchResult(creator: CreatorWithUser): CreatorSearchResult {
  return {
    id: creator.user.id,
    username: creator.user.username,
    name: creator.user.name,
    bio: creator.user.bio,
    followersCount: creator._count.followers,
  };
}
