import { prisma } from "@/lib/prisma";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";

export type CreatorSearchResult = {
  id: string;
  username: string | null;
  name: string;
  bio: string | null;
  followersCount: number;
};

type UserWithCreator = Awaited<ReturnType<typeof findMatchingCreators>>[number];

/**
 * Ricerca indipendente per tipo "Creator": stesso pattern di searchJourneys.ts,
 * nessuna dipendenza reciproca tra i due moduli.
 * "Creator" qui significa: utente con almeno un Journey pubblicato (coerente con
 * il criterio già usato da Recommended/Feed), non un semplice utente registrato.
 */
export async function searchCreators(query: string, limit = 12): Promise<CreatorSearchResult[]> {
  const users = await findMatchingCreators(query);
  return rankByRelevance(users, query)
    .slice(0, limit)
    .map(toCreatorSearchResult);
}

async function findMatchingCreators(query: string) {
  return prisma.user.findMany({
    where: {
      deletedAt: null,
      creator: {
        is: {
          deletedAt: null,
          journeys: { some: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null } },
        },
      },
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { username: { contains: query, mode: "insensitive" } },
        { bio: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { creator: { include: { _count: { select: { followers: true } } } } },
    take: 50,
  });
}

/** Corrispondenza nel nome prima di username/bio, nessun ranking più sofisticato. */
function rankByRelevance(users: UserWithCreator[], query: string): UserWithCreator[] {
  const q = query.toLowerCase();
  return [...users].sort((a, b) => matchScore(a, q) - matchScore(b, q));
}

function matchScore(user: UserWithCreator, q: string): number {
  if (user.name.toLowerCase().includes(q)) return 0;
  if (user.username?.toLowerCase().includes(q)) return 1;
  return 2;
}

function toCreatorSearchResult(user: UserWithCreator): CreatorSearchResult {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    bio: user.bio,
    followersCount: user.creator?._count.followers ?? 0,
  };
}
