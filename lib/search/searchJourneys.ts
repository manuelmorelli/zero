import { prisma } from "@/lib/prisma";
import type { JourneyCardData } from "@/components/journey/JourneyCard";

type JourneyWithCreator = Awaited<ReturnType<typeof findMatchingJourneys>>[number];

/**
 * Ricerca indipendente per tipo "Journey": punto di estensione futuro per altri
 * tipi di risultato (Categories, Workshop, Eventi, ...) senza toccare questo file.
 * Ogni tipo di ricerca vive nel proprio modulo sotto lib/search/ e viene composto
 * dal chiamante (app/search/page.tsx), stesso pattern già usato in lib/discovery/.
 */
export async function searchJourneys(query: string, limit = 12): Promise<JourneyCardData[]> {
  const journeys = await findMatchingJourneys(query);
  return rankByRelevance(journeys, query)
    .slice(0, limit)
    .map(toJourneyCardData);
}

async function findMatchingJourneys(query: string) {
  return prisma.journey.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
        // Le liste (tags) non supportano "contains" case-insensitive lato Prisma/Postgres:
        // qui si confronta il tag per intero, non una sua sottostringa. Limite noto,
        // accettabile per l'MVP: titolo, presentazione e categoria coprono già la maggior
        // parte dei casi reali di ricerca.
        { tags: { hasSome: [query] } },
      ],
    },
    include: { creator: { include: { _count: { select: { followers: true } } } } },
    take: 50,
  });
}

/** Corrispondenza nel titolo prima di descrizione/categoria/tag, nessun ranking più sofisticato. */
function rankByRelevance(journeys: JourneyWithCreator[], query: string): JourneyWithCreator[] {
  const q = query.toLowerCase();
  return [...journeys].sort((a, b) => matchScore(a, q) - matchScore(b, q));
}

function matchScore(journey: JourneyWithCreator, q: string): number {
  if (journey.title.toLowerCase().includes(q)) return 0;
  if (journey.description?.toLowerCase().includes(q)) return 1;
  return 2;
}

function toJourneyCardData(journey: JourneyWithCreator): JourneyCardData {
  return {
    id: journey.id,
    title: journey.title,
    coverUrl: journey.coverUrl,
    category: journey.category,
    creator: { displayName: journey.creator.displayName },
    followersCount: journey.creator._count.followers,
  };
}
