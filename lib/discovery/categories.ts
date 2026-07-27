import { prisma } from "@/lib/prisma";

/**
 * Numero di Journey pubblicati per categoria. Usato sia da `/categories`
 * (indice categorie) sia dalla sezione "Categories" in Home, unica fonte
 * per non duplicare la stessa query in più punti.
 */
export async function getJourneyCountsByCategory(): Promise<Map<string, number>> {
  const counts = await prisma.journey.groupBy({
    by: ["category"],
    where: { status: "PUBLISHED", deletedAt: null },
    _count: true,
  });

  return new Map(
    counts
      .filter((row): row is typeof row & { category: string } => row.category !== null)
      .map((row) => [row.category, row._count])
  );
}
