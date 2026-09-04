import { prisma } from "@/lib/prisma";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { JOURNEY_CATEGORIES, categoryToSlug } from "@/lib/constants/categories";
import { resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";

export type JourneyerCategoryRow = {
  category: string;
  slug: string;
  journeyers: CreatorSearchResult[];
};

const JOURNEYERS_PER_ROW = 12;

/**
 * Journeyer (creator con almeno un Journey live) raggruppati per categoria, per la pagina
 * /journeyers: un Journeyer compare in ogni categoria in cui ha pubblicato, ordinati per
 * follower dentro ciascuna riga. Stesso criterio "categoria = categoria dei Journey pubblicati"
 * già usato in lib/discovery/recommendedCreators.ts.
 */
export async function getJourneyersByCategory(): Promise<JourneyerCategoryRow[]> {
  const creators = await prisma.creator.findMany({
    where: {
      deletedAt: null,
      journeys: { some: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null } },
    },
    include: {
      user: { include: { _count: { select: { followers: true } } } },
      journeys: {
        where: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null, category: { not: null } },
        select: { category: true },
        distinct: ["category"],
      },
    },
  });

  // Risolta una sola volta per creator, in parallelo, anche se compare in più righe/categorie:
  // stessa istanza condivisa tra le righe, non un'immagine risolta per ogni apparizione.
  const results: CreatorSearchResult[] = await Promise.all(
    creators.map(async (creator) => ({
      id: creator.user.id,
      username: creator.user.username,
      name: creator.user.name,
      bio: creator.user.bio,
      avatarUrl: await resolveCoverUrl(creator.user.avatarUrl),
      followersCount: creator.user._count.followers,
    }))
  );

  const byCategory = new Map<string, CreatorSearchResult[]>();
  creators.forEach((creator, index) => {
    const result = results[index];
    for (const journey of creator.journeys) {
      if (!journey.category) continue;
      const list = byCategory.get(journey.category) ?? [];
      list.push(result);
      byCategory.set(journey.category, list);
    }
  });

  const rows: JourneyerCategoryRow[] = [];
  for (const category of JOURNEY_CATEGORIES) {
    const list = byCategory.get(category);
    if (!list || list.length === 0) continue;

    rows.push({
      category,
      slug: categoryToSlug(category),
      journeyers: [...list].sort((a, b) => b.followersCount - a.followersCount).slice(0, JOURNEYERS_PER_ROW),
    });
  }
  return rows;
}

/**
 * Journeyer il cui Journey è attualmente in Discovery Phase (stessa logica di
 * lib/discovery/discoveringNow.ts, applicata ai creator invece che ai singoli Journey), per la
 * riga "New Journeyers" in cima a /journeyers.
 */
export async function getNewJourneyers(limit = 12): Promise<CreatorSearchResult[]> {
  const creators = await prisma.creator.findMany({
    where: { deletedAt: null, journeys: { some: { status: "DISCOVERY", deletedAt: null } } },
    include: { user: { include: { _count: { select: { followers: true } } } } },
  });

  const sorted = creators
    .sort((a, b) => b.user._count.followers - a.user._count.followers)
    .slice(0, limit);

  return Promise.all(
    sorted.map(async (creator) => ({
      id: creator.user.id,
      username: creator.user.username,
      name: creator.user.name,
      bio: creator.user.bio,
      avatarUrl: await resolveCoverUrl(creator.user.avatarUrl),
      followersCount: creator.user._count.followers,
    }))
  );
}
