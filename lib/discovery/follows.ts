import { prisma } from "@/lib/prisma";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";

/**
 * Id dei Creator seguiti da un utente. Follow è persona-segue-persona (vedi
 * 00-project-context.md, sezione "Modello utente unico"): si parte dagli userId seguiti
 * e si risolvono i Creator corrispondenti, non tutti hanno pubblicato un Journey. Usato da
 * tutte le sezioni Discovery che dipendono da "chi segui" (Recommended Journeys, Recommended
 * Creators, Feed dei creator seguiti), per non duplicare la stessa query in più moduli.
 */
export async function getFollowedCreatorIds(userId: string): Promise<string[]> {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followedUserIds = follows.map((follow) => follow.followingId);
  if (followedUserIds.length === 0) return [];

  const creators = await prisma.creator.findMany({
    where: { userId: { in: followedUserIds } },
    select: { id: true },
  });
  return creators.map((creator) => creator.id);
}

/** Id del profilo Creator dell'utente stesso, se ne ha uno (per escluderlo dai propri suggerimenti). */
export async function getOwnCreatorId(userId: string): Promise<string | null> {
  const creator = await prisma.creator.findUnique({ where: { userId }, select: { id: true } });
  return creator?.id ?? null;
}

/**
 * Categorie pubblicate dai creator indicati. Usato per orientare Recommended Journeys
 * e Creator consigliati verso le categorie dei creator che l'utente segue già.
 */
export async function getFollowedCategories(creatorIds: string[]): Promise<string[]> {
  if (creatorIds.length === 0) return [];
  const journeys = await prisma.journey.findMany({
    where: {
      creatorId: { in: creatorIds },
      status: { in: LIVE_JOURNEY_STATUSES },
      deletedAt: null,
      category: { not: null },
    },
    select: { category: true },
    distinct: ["category"],
  });
  return journeys.map((journey) => journey.category).filter((category): category is string => category !== null);
}
