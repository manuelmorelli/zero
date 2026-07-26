import { prisma } from "@/lib/prisma";

/**
 * Id dei Creator seguiti da un utente (Follow.creatorId). Usato da tutte le sezioni
 * Discovery che dipendono da "chi segui" (Recommended Journeys, Feed dei creator seguiti),
 * per non duplicare la stessa query in più moduli.
 */
export async function getFollowedCreatorIds(userId: string): Promise<string[]> {
  const follows = await prisma.follow.findMany({
    where: { userId },
    select: { creatorId: true },
  });
  return follows.map((follow) => follow.creatorId);
}
