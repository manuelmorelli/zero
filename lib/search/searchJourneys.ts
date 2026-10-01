import { prisma } from "@/lib/prisma";
import type { JourneyCardData } from "@/components/journey/JourneyCard";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";
import { withResolvedJourneyCardUrls } from "@/lib/media/resolveCoverUrl";
import { toSearchWords } from "@/lib/search/queryWords";
import type { JourneyCategory } from "@/lib/constants/categories";
import { JOURNEY_DATE_PRESETS, type JourneyDatePreset } from "@/lib/constants/journeyDatePresets";

type JourneyWithCreator = Awaited<ReturnType<typeof findMatchingJourneys>>[number];

const DATE_PRESET_DAYS: Record<JourneyDatePreset, number> = {
  today: 1,
  week: 7,
  month: 30,
  year: 365,
};

export type JourneySearchFilters = {
  category?: JourneyCategory;
  datePreset?: JourneyDatePreset;
};

/**
 * Ricerca indipendente per tipo "Journey": punto di estensione futuro per altri
 * tipi di risultato (Categories, Workshop, Eventi, ...) senza toccare questo file.
 * Ogni tipo di ricerca vive nel proprio modulo sotto lib/search/ e viene composto
 * dal chiamante (app/search/page.tsx), stesso pattern già usato in lib/discovery/.
 *
 * `query` può essere vuota se sono presenti dei `filters`: si naviga per categoria/data senza
 * per forza scrivere del testo, come i filtri di YouTube usati anche senza una ricerca testuale.
 */
export async function searchJourneys(
  query: string,
  filters: JourneySearchFilters = {},
  limit = 12
): Promise<JourneyCardData[]> {
  const journeys = await findMatchingJourneys(query, filters);
  const selected = rankByRelevance(journeys, query).slice(0, limit);

  // Il badge del punteggio si mostra solo per i Journey già PUBLISHED: quelli in Discovery Phase
  // non partecipano al Journey Score (vedi lib/scoring/journeyScore.ts).
  const publishedIds = selected.filter((journey) => journey.status === "PUBLISHED").map((journey) => journey.id);
  await ensureFreshJourneyScores(publishedIds);
  const freshScores = publishedIds.length > 0
    ? await prisma.journey.findMany({ where: { id: { in: publishedIds } }, select: { id: true, journeyScore: true } })
    : [];
  const scoreById = new Map(freshScores.map((journey) => [journey.id, journey.journeyScore]));

  const items = selected.map((journey) => toJourneyCardData(journey, scoreById.get(journey.id)));
  return withResolvedJourneyCardUrls(items);
}

async function findMatchingJourneys(query: string, filters: JourneySearchFilters) {
  const words = toSearchWords(query);
  return prisma.journey.findMany({
    where: {
      status: { in: LIVE_JOURNEY_STATUSES },
      deletedAt: null,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.datePreset
        ? { publishedAt: { gte: new Date(Date.now() - DATE_PRESET_DAYS[filters.datePreset] * 24 * 60 * 60 * 1000) } }
        : {}),
      // Ogni parola della query deve comparire da qualche parte (titolo, storia, categoria o
      // tag), non necessariamente tutte nello stesso campo: così "burnout creativo" trova anche
      // un titolo tipo "il mio burnout da lavoro creativo", non solo la frase esatta.
      AND: words.map((word) => ({
        OR: [
          { title: { contains: word, mode: "insensitive" } },
          { description: { contains: word, mode: "insensitive" } },
          { category: { contains: word, mode: "insensitive" } },
          // Le liste (tags) non supportano "contains" case-insensitive lato Prisma/Postgres:
          // qui si confronta il tag per intero, non una sua sottostringa. Limite noto,
          // accettabile per l'MVP: titolo, presentazione e categoria coprono già la maggior
          // parte dei casi reali di ricerca.
          { tags: { hasSome: [word] } },
        ],
      })),
    },
    include: { creator: { include: { user: { select: { avatarUrl: true, _count: { select: { followers: true } } } } } } },
    orderBy: { publishedAt: "desc" },
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

function toJourneyCardData(journey: JourneyWithCreator, journeyScore?: number): JourneyCardData {
  return {
    id: journey.id,
    title: journey.title,
    coverUrl: journey.coverUrl,
    category: journey.category,
    journeyScore,
    creator: { displayName: journey.creator.displayName, avatarUrl: journey.creator.user.avatarUrl },
  };
}
