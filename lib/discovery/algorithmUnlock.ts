import { prisma } from "@/lib/prisma";

// Soglia di volume prima di attivare il ranking algoritmico reale (Top Journeys, spinta extra in
// Recommended) invece dell'ordine cronologico. Non arbitraria: sotto questa soglia, una sezione
// "Top" da poche posizioni finirebbe per mostrare quasi l'intero catalogo — il ranking comincia a
// significare qualcosa solo quando "i migliori" sono un sottoinsieme reale, non quasi tutto quello
// che esiste. Vedi docs/94_Product_Backlog.md e docs/08_Algorithm.md.
export const ALGORITHMIC_RANKING_MIN_PUBLISHED_JOURNEYS = 100;

export async function isAlgorithmicRankingUnlocked(): Promise<boolean> {
  const publishedCount = await prisma.journey.count({
    where: { status: "PUBLISHED", deletedAt: null },
  });
  return publishedCount >= ALGORITHMIC_RANKING_MIN_PUBLISHED_JOURNEYS;
}
