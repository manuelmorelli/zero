import { prisma } from "@/lib/prisma";
import { getWildcardJourneyIds } from "@/lib/discovery/wildcard";
import { resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";

/**
 * Creator dietro il pick Wildcard stabile di ciascuna categoria (lib/discovery/wildcard.ts):
 * stessa selezione a caso già usata per la card Wildcard di /journeys, mostrata qui come
 * creator da seguire invece che come singolo Journey. Un creator già mostrato non si ripete
 * anche se il suo Journey vince la Wildcard in più categorie.
 */
export async function getWildcardsToFollow(limit = 10, wildcardJourneyIds?: string[]): Promise<CreatorSearchResult[]> {
  const journeyIds = wildcardJourneyIds ?? (await getWildcardJourneyIds());
  if (journeyIds.length === 0) return [];

  const pickedJourneys = await prisma.journey.findMany({
    where: { id: { in: journeyIds } },
    include: { creator: { include: { user: { include: { _count: { select: { followers: true } } } } } } },
  });
  const journeyById = new Map(pickedJourneys.map((journey) => [journey.id, journey]));

  const seenCreatorIds = new Set<string>();
  const creators: CreatorSearchResult[] = [];

  for (const journeyId of journeyIds) {
    if (creators.length >= limit) break;
    const journey = journeyById.get(journeyId);
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
