import { prisma } from "@/lib/prisma";

/**
 * Id dei Creator seguiti da un utente (Follow.creatorId). Usato da tutte le sezioni
 * Discovery che dipendono da "chi segui" (Recommended Journeys, Recommended Creators,
 * Feed dei creator seguiti), per non duplicare la stessa query in più moduli.
 */
export async function getFollowedCreatorIds(userId: string): Promise<string[]> {
  const follows = await prisma.follow.findMany({
    where: { userId },
    select: { creatorId: true },
  });
  return follows.map((follow) => follow.creatorId);
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
      status: "PUBLISHED",
      deletedAt: null,
      category: { not: null },
    },
    select: { category: true },
    distinct: ["category"],
  });
  return journeys.map((journey) => journey.category).filter((category): category is string => category !== null);
}
