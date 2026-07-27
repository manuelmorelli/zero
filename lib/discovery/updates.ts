import { prisma } from "@/lib/prisma";
import { getFollowedCreatorIds } from "@/lib/discovery/follows";
import { deleteExpiredUpdates } from "@/lib/updates";

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
  limit?: number;
};

/**
 * Updates ancora attivi dei creator seguiti dall'utente, i più recenti prima. Sistema separato
 * dal Feed (`lib/discovery/feed.ts`): il Feed mostra eventi permanenti del Journey, questi sono
 * contenuti brevi e temporanei (09_Updates.md), nessuna sovrapposizione di dati o di query.
 */
export async function getFollowedCreatorsUpdates({
  userId,
  limit = 10,
}: GetFollowedCreatorsUpdatesParams): Promise<FollowedUpdate[]> {
  if (!userId) return [];

  const followedCreatorIds = await getFollowedCreatorIds(userId);
  if (followedCreatorIds.length === 0) return [];

  await deleteExpiredUpdates();

  const updates = await prisma.update.findMany({
    where: {
      creatorId: { in: followedCreatorIds },
      archivedAt: { gt: new Date() },
    },
    include: { creator: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return updates.map((update) => ({
    id: update.id,
    creatorId: update.creatorId,
    creatorName: update.creator.displayName,
    content: update.content,
    publishedAt: update.publishedAt,
  }));
}
