import { prisma } from "@/lib/prisma";

/** True se una delle due persone ha bloccato l'altra, in una direzione o nell'altra: l'effetto
 * (niente follow, niente messaggi, profilo non disponibile) è lo stesso da entrambi i lati. */
export async function isBlockedEitherWay(userId1: string, userId2: string): Promise<boolean> {
  if (userId1 === userId2) return false;
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userId1, blockedId: userId2 },
        { blockerId: userId2, blockedId: userId1 },
      ],
    },
    select: { id: true },
  });
  return Boolean(block);
}
