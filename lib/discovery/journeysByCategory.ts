import { prisma } from "@/lib/prisma";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { JOURNEY_CATEGORIES, categoryToSlug } from "@/lib/constants/categories";
import { withResolvedCoverUrls } from "@/lib/media/resolveCoverUrl";
import type { JourneyCardData } from "@/components/journey/JourneyCard";

export type JourneyCategoryRow = {
  category: string;
  slug: string;
  journeys: JourneyCardData[];
  /** Id di un Journey scelto a caso tra quelli della categoria, per la card Wildcard della riga. */
  wildcardJourneyId: string | null;
};

const JOURNEYS_PER_ROW = 12;

/**
 * Tutti i Journey live raggruppati per categoria, per la pagina /journeys: una riga scorrevole
 * per categoria (solo quelle con almeno un Journey), stesso ordine di JOURNEY_CATEGORIES.
 */
export async function getJourneysByCategory(): Promise<JourneyCategoryRow[]> {
  const journeys = await prisma.journey.findMany({
    where: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null, category: { not: null } },
    orderBy: { publishedAt: "desc" },
    include: { creator: true },
  });
  const resolved = await withResolvedCoverUrls(journeys);

  const byCategory = new Map<string, typeof resolved>();
  for (const journey of resolved) {
    if (!journey.category) continue;
    const list = byCategory.get(journey.category) ?? [];
    list.push(journey);
    byCategory.set(journey.category, list);
  }

  const rows: JourneyCategoryRow[] = [];
  for (const category of JOURNEY_CATEGORIES) {
    const list = byCategory.get(category);
    if (!list || list.length === 0) continue;

    const wildcard = list[Math.floor(Math.random() * list.length)]!;
    rows.push({
      category,
      slug: categoryToSlug(category),
      journeys: list.slice(0, JOURNEYS_PER_ROW).map((journey) => ({
        id: journey.id,
        title: journey.title,
        coverUrl: journey.coverUrl,
        category: journey.category,
        creator: { displayName: journey.creator.displayName },
      })),
      wildcardJourneyId: wildcard.id,
    });
  }
  return rows;
}
