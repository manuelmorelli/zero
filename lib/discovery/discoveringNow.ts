import { prisma } from "@/lib/prisma";
import { getPublishedEpisodeCounts } from "@/lib/journey/episodeCounts";
import { resolveAvatarUrl, resolveCoverUrl } from "@/lib/media/resolveCoverUrl";

export type DiscoveringNowItem = {
  id: string;
  title: string;
  coverUrl: string | null;
  category: string | null;
  creatorName: string;
  /** Per il link al profilo dal nome sulla card. */
  creatorUserId?: string;
  creatorAvatarUrl: string | null;
  followersCount: number;
  episodesCount: number;
  /** Giorni rimanenti prima che il Journey esca dalla Discovery Phase (minimo 1). */
  daysLeft: number;
};

/**
 * Tutti i Journey attualmente in Discovery Phase (08_Algorithm.md, "Discovery Phase"), senza
 * alcuna personalizzazione per interessi o creator seguiti: l'obiettivo è aiutare le persone a
 * scoprire passioni nuove, non solo confermare quelle che hanno già. Sezione "Discovering Now"
 * in Home, separata di proposito da Recommended (che resta mirata per interessi) — il Journey
 * Score non entra mai in gioco qui, coerente con "sezioni base garantite a tutti dal primo secondo".
 */
export async function getDiscoveringNowJourneys(limit = 10): Promise<DiscoveringNowItem[]> {
  const journeys = await prisma.journey.findMany({
    where: { status: "DISCOVERY", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { creator: { include: { user: { select: { avatarUrl: true, _count: { select: { followers: true } } } } } } },
  });

  const episodeCounts = await getPublishedEpisodeCounts(journeys.map((journey) => journey.id));
  const now = Date.now();
  const items = journeys.map((journey) => ({
    id: journey.id,
    title: journey.title,
    coverUrl: journey.coverUrl,
    category: journey.category,
    creatorName: journey.creator.displayName,
    creatorUserId: journey.creator.userId,
    creatorAvatarUrl: journey.creator.user.avatarUrl,
    followersCount: journey.creator.user._count.followers,
    episodesCount: episodeCounts.get(journey.id) ?? 0,
    daysLeft: journey.discoveryEndsAt
      ? Math.max(1, Math.ceil((journey.discoveryEndsAt.getTime() - now) / (24 * 60 * 60 * 1000)))
      : 1,
  }));
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      coverUrl: await resolveCoverUrl(item.coverUrl),
      creatorAvatarUrl: await resolveAvatarUrl(item.creatorAvatarUrl),
    }))
  );
}
