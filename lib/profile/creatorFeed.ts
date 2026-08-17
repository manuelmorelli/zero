import { prisma } from "@/lib/prisma";
import { deleteExpiredUpdates } from "@/lib/updates";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { resolveCoverUrl, withResolvedCoverUrls } from "@/lib/media/resolveCoverUrl";

export type CreatorFeedItem = {
  date: Date;
  coverUrl: string | null;
  likeCount: number;
  isLiked: boolean;
} & (
  | {
      type: "episode";
      episodeId: string;
      journeyId: string;
      title: string;
      caption: string | null;
      category: string | null;
    }
  | { type: "update"; updateId: string; content: string }
);

type GetCreatorFeedParams = {
  creatorId: string;
  /** null se il visitatore non è loggato: nessun Like può essere suo. */
  viewerUserId: string | null;
  limit?: number;
};

/**
 * Feed cronologico personale di un singolo creator per il suo Profilo pubblico: mescola i suoi
 * Episodi (di Journey pubblicati) e i suoi Update ancora attivi, in stile "photo feed". Diverso
 * dal Feed di Home (`lib/discovery/feed.ts`, eventi di più creator seguiti): qui la fonte è un
 * solo creator, e ogni elemento porta con sé conteggio Like + stato Like del visitatore.
 */
export async function getCreatorFeed({
  creatorId,
  viewerUserId,
  limit = 20,
}: GetCreatorFeedParams): Promise<CreatorFeedItem[]> {
  await deleteExpiredUpdates();

  const [episodes, updates, latestJourney] = await Promise.all([
    prisma.episode.findMany({
      where: {
        deletedAt: null,
        publishedAt: { not: null },
        OR: [{ chapterId: null }, { chapter: { deletedAt: null } }],
        journey: { creatorId, status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null },
      },
      include: { journey: true },
      orderBy: { occurredAt: "desc" },
      take: limit,
    }),
    prisma.update.findMany({
      where: { creatorId, archivedAt: { gt: new Date() } },
      orderBy: { publishedAt: "desc" },
      take: limit,
    }),
    // Gli Update non hanno un Journey proprio: per non lasciarli senza immagine nel feed
    // fotografico, prendono in prestito la copertina del Journey live più recente.
    prisma.journey.findFirst({
      where: { creatorId, status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null },
      orderBy: { publishedAt: "desc" },
      select: { coverUrl: true },
    }),
  ]);
  const updateCoverUrl = await resolveCoverUrl(latestJourney?.coverUrl ?? null);

  const likeTargets = [
    ...episodes.map((episode) => ({ targetType: "EPISODE" as const, targetId: episode.id })),
    ...updates.map((update) => ({ targetType: "UPDATE" as const, targetId: update.id })),
  ];
  const { countByTarget, likedByViewer } = await getLikeSummary(likeTargets, viewerUserId);

  const items: CreatorFeedItem[] = [
    ...episodes.map((episode): CreatorFeedItem => ({
      type: "episode",
      date: episode.occurredAt,
      episodeId: episode.id,
      journeyId: episode.journeyId,
      title: episode.title,
      caption: episode.caption,
      category: episode.journey.category,
      coverUrl: episode.journey.coverUrl,
      likeCount: countByTarget.get(`EPISODE:${episode.id}`) ?? 0,
      isLiked: likedByViewer.has(`EPISODE:${episode.id}`),
    })),
    ...updates.map((update): CreatorFeedItem => ({
      type: "update",
      date: update.publishedAt,
      updateId: update.id,
      content: update.content,
      coverUrl: updateCoverUrl,
      likeCount: countByTarget.get(`UPDATE:${update.id}`) ?? 0,
      isLiked: likedByViewer.has(`UPDATE:${update.id}`),
    })),
  ];

  return withResolvedCoverUrls(items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit));
}

async function getLikeSummary(
  targets: { targetType: "EPISODE" | "UPDATE"; targetId: string }[],
  viewerUserId: string | null
) {
  const countByTarget = new Map<string, number>();
  const likedByViewer = new Set<string>();
  if (targets.length === 0) return { countByTarget, likedByViewer };

  const targetIds = targets.map((target) => target.targetId);
  const grouped = await prisma.like.groupBy({
    by: ["targetType", "targetId"],
    where: { targetId: { in: targetIds } },
    _count: { _all: true },
  });
  for (const group of grouped) {
    // groupBy non filtra per coppie (targetType, targetId): un id potrebbe in teoria
    // comparire come Episodio in un gruppo e come Update in un altro, per questo il
    // conteggio si accumula sempre sulla chiave composta, mai sul solo targetId.
    if (targets.some((target) => target.targetType === group.targetType && target.targetId === group.targetId)) {
      countByTarget.set(`${group.targetType}:${group.targetId}`, group._count._all);
    }
  }

  if (viewerUserId) {
    const viewerLikes = await prisma.like.findMany({
      where: { userId: viewerUserId, targetId: { in: targetIds } },
      select: { targetType: true, targetId: true },
    });
    for (const like of viewerLikes) {
      likedByViewer.add(`${like.targetType}:${like.targetId}`);
    }
  }

  return { countByTarget, likedByViewer };
}
