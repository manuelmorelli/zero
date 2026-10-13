import { prisma } from "@/lib/prisma";

/** Episodi pubblicati (con o senza Capitolo) per ciascun Journey, con una sola query: serve alle
 * card Journey ("N episodes" sotto il titolo). I Journey senza episodi non compaiono nella mappa. */
export async function getPublishedEpisodeCounts(journeyIds: string[]): Promise<Map<string, number>> {
  if (journeyIds.length === 0) return new Map();
  const rows = await prisma.episode.groupBy({
    by: ["journeyId"],
    where: { journeyId: { in: journeyIds }, deletedAt: null, publishedAt: { not: null } },
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [row.journeyId, row._count._all]));
}
