import { prisma } from "@/lib/prisma";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { JOURNEY_CATEGORIES } from "@/lib/constants/categories";
import { getStableWildcardPicks } from "@/lib/discovery/wildcard";
import { resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";

/**
 * Creator dietro il pick Wildcard stabile di ciascuna categoria (lib/discovery/wildcard.ts):
 * stessa selezione a caso già usata per la card Wildcard di /journeys, mostrata qui come
 * creator da seguire invece che come singolo Journey. Un creator già mostrato non si ripete
 * anche se il suo Journey vince la Wildcard in più categorie.
 */
export async function getWildcardsToFollow(limit = 10): Promise<CreatorSearchResult[]> {
  const journeys = await prisma.journey.findMany({
    where: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null, category: { not: null } },
    select: { id: true, category: true },
  });

  const byCategory = new Map<string, { id: string }[]>();
  for (const journey of journeys) {
    if (!journey.category) continue;
    const list = byCategory.get(journey.category) ?? [];
    list.push({ id: journey.id });
    byCategory.set(journey.category, list);
  }

  const picks = await getStableWildcardPicks(byCategory);
  if (picks.size === 0) return [];

  const pickedJourneys = await prisma.journey.findMany({
    where: { id: { in: Array.from(picks.values()) } },
    include: { creator: { include: { user: { include: { _count: { select: { followers: true } } } } } } },
  });
  const journeyById = new Map(pickedJourneys.map((journey) => [journey.id, journey]));

  const seenCreatorIds = new Set<string>();
  const creators: CreatorSearchResult[] = [];

  for (const category of JOURNEY_CATEGORIES) {
    if (creators.length >= limit) break;
    const journeyId = picks.get(category);
    const journey = journeyId ? journeyById.get(journeyId) : undefined;
    if (!journey || seenCreatorIds.has(journey.creator.id)) continue;
    seenCreatorIds.add(journey.creator.id);

    creators.push({
      id: journey.creator.user.id,
      username: journey.creator.user.username,
      name: journey.creator.user.name,
      bio: journey.creator.user.bio,
      avatarUrl: await resolveCoverUrl(journey.creator.user.avatarUrl),
      followersCount: journey.creator.user._count.followers,
    });
  }

  return creators;
}
