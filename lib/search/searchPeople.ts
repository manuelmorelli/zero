import { prisma } from "@/lib/prisma";

export type PersonSearchResult = {
  id: string;
  username: string | null;
  name: string;
  followersCount: number;
};

/**
 * Ricerca per QUALUNQUE persona registrata, non solo i Creator con un Journey pubblicato (quello
 * resta searchCreators.ts, invariato) — coerente con "Follow universale" (00-project-context.md):
 * si può seguire chiunque, quindi si deve poter trovare chiunque, non solo chi ha pubblicato.
 * `excludeIds` evita di mostrare due volte la stessa persona già comparsa tra i Creator.
 */
export async function searchPeople(
  query: string,
  excludeIds: string[] = [],
  limit = 12
): Promise<PersonSearchResult[]> {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      id: { notIn: excludeIds },
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { username: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { _count: { select: { followers: true } } },
    take: 50,
  });

  const q = query.toLowerCase();
  const ranked = [...users].sort((a, b) => matchScore(a, q) - matchScore(b, q));

  return ranked.slice(0, limit).map((user) => ({
    id: user.id,
    username: user.username,
    name: user.name,
    followersCount: user._count.followers,
  }));
}

function matchScore(user: { name: string; username: string | null }, q: string): number {
  if (user.name.toLowerCase().includes(q)) return 0;
  if (user.username?.toLowerCase().includes(q)) return 1;
  return 2;
}
