import { prisma } from "@/lib/prisma";
import { getFollowedCreatorIds, getOwnCreatorId, getFollowedCategories } from "@/lib/discovery/follows";
import { deleteExpiredUpdates } from "@/lib/updates";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";

export type FollowedUpdate = {
  id: string;
  creatorId: string;
  creatorName: string;
  content: string;
  publishedAt: Date;
};

type GetFollowedCreatorsUpdatesParams = {
  /** null se l'utente non è loggato: gli Updates dei creator seguiti non esistono senza un account. */
  userId: string | null;
  /** Interessi dichiarati dall'utente (Onboarding/Profilo), usati per la quota "creator potenzialmente interessanti". */
  interests?: string[];
  limit?: number;
};

type UpdateWithCreator = Awaited<ReturnType<typeof findInterestingCreatorsUpdates>>[number];

/**
 * Updates ancora attivi, i più recenti prima. Sistema separato dal Feed (`lib/discovery/feed.ts`):
 * il Feed mostra eventi permanenti del Journey, questi sono contenuti brevi e temporanei
 * (09_Updates.md), nessuna sovrapposizione di dati o di query.
 *
 * Mix 80/20 (08_Algorithm.md, "Feed Updates"): soprattutto Update dei creator già seguiti, con una
 * piccola quota (20%) di creator non ancora seguiti ma potenzialmente interessanti — stesse
 * categorie dei creator seguiti o degli interessi dichiarati, stesso criterio già usato da
 * "Creator consigliati" (lib/discovery/recommendedCreators.ts). Se i follow non bastano a riempire
 * l'80%, la quota "interessanti" si allarga per compensare, così la sezione resta piena anche per
 * chi non segue ancora nessuno.
 */
export async function getFollowedCreatorsUpdates({
  userId,
  interests = [],
  limit = 10,
}: GetFollowedCreatorsUpdatesParams): Promise<FollowedUpdate[]> {
  if (!userId) return [];

  await deleteExpiredUpdates();

  const followedCreatorIds = await getFollowedCreatorIds(userId);
  const ownCreatorId = await getOwnCreatorId(userId);

  const followedShare = Math.ceil(limit * 0.8);
  const followedUpdates = followedCreatorIds.length > 0
    ? await prisma.update.findMany({
        where: { creatorId: { in: followedCreatorIds }, archivedAt: { gt: new Date() } },
        include: { creator: true },
        orderBy: { publishedAt: "desc" },
        take: followedShare,
      })
    : [];

  const remainingSlots = limit - followedUpdates.length;
  const excludedCreatorIds = ownCreatorId
    ? [...followedCreatorIds, ownCreatorId]
    : followedCreatorIds;

  const interestingUpdates = remainingSlots > 0
    ? await findInterestingCreatorsUpdates({ excludedCreatorIds, interests, limit: remainingSlots })
    : [];

  return [...followedUpdates, ...interestingUpdates].map(toFollowedUpdate);
}

async function findInterestingCreatorsUpdates({
  excludedCreatorIds,
  interests,
  limit,
}: {
  excludedCreatorIds: string[];
  interests: string[];
  limit: number;
}) {
  const followedCategories = excludedCreatorIds.length > 0 ? await getFollowedCategories(excludedCreatorIds) : [];
  const candidateCategories = Array.from(new Set([...followedCategories, ...interests]));

  return prisma.update.findMany({
    where: {
      archivedAt: { gt: new Date() },
      creatorId: { notIn: excludedCreatorIds },
      ...(candidateCategories.length > 0
        ? {
            creator: {
              journeys: { some: { status: { in: LIVE_JOURNEY_STATUSES }, category: { in: candidateCategories } } },
            },
          }
        : {}),
    },
    include: { creator: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

function toFollowedUpdate(update: UpdateWithCreator): FollowedUpdate {
  return {
    id: update.id,
    creatorId: update.creatorId,
    creatorName: update.creator.displayName,
    content: update.content,
    publishedAt: update.publishedAt,
  };
}
