import { prisma } from "@/lib/prisma";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { JOURNEY_CATEGORIES, categoryToSlug, type JourneyCategory } from "@/lib/constants/categories";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";
import { resolveAvatarUrl, withResolvedCoverUrls } from "@/lib/media/resolveCoverUrl";
import { getStableWildcardPicks } from "@/lib/discovery/wildcard";
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
    include: { creator: { include: { user: { select: { avatarUrl: true } } } } },
  });
  // Il badge del punteggio si mostra solo per i Journey già PUBLISHED: quelli in Discovery Phase
  // non partecipano al Journey Score (vedi lib/scoring/journeyScore.ts).
  const publishedIds = journeys.filter((journey) => journey.status === "PUBLISHED").map((journey) => journey.id);
  await ensureFreshJourneyScores(publishedIds);
  const freshScores = publishedIds.length > 0
    ? await prisma.journey.findMany({ where: { id: { in: publishedIds } }, select: { id: true, journeyScore: true } })
    : [];
  const scoreById = new Map(freshScores.map((journey) => [journey.id, journey.journeyScore]));

  const resolved = await withResolvedCoverUrls(journeys);

  const byCategory = new Map<string, typeof resolved>();
  for (const journey of resolved) {
    if (!journey.category) continue;
    const list = byCategory.get(journey.category) ?? [];
    list.push(journey);
    byCategory.set(journey.category, list);
  }

  const wildcardPicks = await getStableWildcardPicks(
    new Map(Array.from(byCategory.entries()).map(([category, list]) => [category, list.map((journey) => ({ id: journey.id }))]))
  );

  const rows: JourneyCategoryRow[] = [];
  for (const category of JOURNEY_CATEGORIES) {
    const list = byCategory.get(category);
    if (!list || list.length === 0) continue;

    rows.push({
      category,
      slug: categoryToSlug(category),
      journeys: await Promise.all(
        list.slice(0, JOURNEYS_PER_ROW).map(async (journey) => ({
          id: journey.id,
          title: journey.title,
          coverUrl: journey.coverUrl,
          category: journey.category,
          journeyScore: scoreById.get(journey.id),
          creator: {
            displayName: journey.creator.displayName,
            avatarUrl: await resolveAvatarUrl(journey.creator.user.avatarUrl),
          },
        }))
      ),
      wildcardJourneyId: wildcardPicks.get(category) ?? null,
    });
  }
  return rows;
}

/**
 * Tutti i Journey live di una singola categoria, senza il limite di 12 della riga scorrevole di
 * /journeys: per la pagina dedicata /categories/[slug] (titolo di categoria cliccabile).
 */
export async function getJourneysInCategory(category: JourneyCategory): Promise<JourneyCardData[]> {
  const journeys = await prisma.journey.findMany({
    where: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null, category },
    orderBy: { publishedAt: "desc" },
    include: { creator: { include: { user: { select: { avatarUrl: true } } } } },
  });

  const publishedIds = journeys.filter((journey) => journey.status === "PUBLISHED").map((journey) => journey.id);
  await ensureFreshJourneyScores(publishedIds);
  const freshScores = publishedIds.length > 0
    ? await prisma.journey.findMany({ where: { id: { in: publishedIds } }, select: { id: true, journeyScore: true } })
    : [];
  const scoreById = new Map(freshScores.map((journey) => [journey.id, journey.journeyScore]));

  const resolved = await withResolvedCoverUrls(journeys);

  return Promise.all(
    resolved.map(async (journey) => ({
      id: journey.id,
      title: journey.title,
      coverUrl: journey.coverUrl,
      category: journey.category,
      journeyScore: scoreById.get(journey.id),
      creator: {
        displayName: journey.creator.displayName,
        avatarUrl: await resolveAvatarUrl(journey.creator.user.avatarUrl),
      },
    }))
  );
}
