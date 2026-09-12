import { prisma } from "@/lib/prisma";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";
import { withResolvedCoverUrls } from "@/lib/media/resolveCoverUrl";

export type LatestVideoItem = {
  episodeId: string;
  journeyId: string;
  title: string;
  coverUrl: string | null;
  category: string | null;
  creatorName: string;
  createdAt: Date;
  /** Journey Score (0-100) del Journey a cui appartiene l'episodio: gli episodi non hanno un
   * punteggio proprio, quindi mostrano quello del loro Journey. Assente se il Journey è ancora
   * in Discovery Phase (non partecipa a questo punteggio, vedi lib/scoring/journeyScore.ts). */
  journeyScore?: number;
};

/**
 * Ultimi episodi con un video caricato, pubblicati su tutta la piattaforma
 * (non filtrati per creator seguiti — è la riga "Latest Videos" della Home, non il Feed).
 * Se l'utente ha dichiarato interessi, quelli nelle sue categorie vengono mostrati per primi,
 * mantenendo comunque l'ordine dal più recente al meno recente dentro ciascun gruppo.
 */
export async function getLatestVideos({
  limit = 10,
  interests = [],
}: { limit?: number; interests?: string[] } = {}): Promise<LatestVideoItem[]> {
  const pool = interests.length > 0 ? Math.max(limit * 4, 20) : limit;

  const episodes = await prisma.episode.findMany({
    where: {
      videoKey: { not: null },
      deletedAt: null,
      publishedAt: { not: null },
      OR: [{ chapterId: null }, { chapter: { deletedAt: null } }],
      journey: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null },
    },
    orderBy: { createdAt: "desc" },
    take: pool,
    include: {
      journey: { include: { creator: true } },
    },
  });

  const ordered = interests.length === 0
    ? episodes
    : (() => {
        const interestSet = new Set(interests);
        const matching = episodes.filter((episode) => episode.journey.category && interestSet.has(episode.journey.category));
        const rest = episodes.filter((episode) => !(episode.journey.category && interestSet.has(episode.journey.category)));
        return [...matching, ...rest];
      })();

  const selected = ordered.slice(0, limit);

  // Il punteggio mostrato è quello del Journey (gli episodi non ne hanno uno proprio): solo per
  // i Journey già PUBLISHED, coerente con "Discovery Phase non partecipa a questo punteggio".
  const publishedJourneyIds = [
    ...new Set(
      selected.filter((episode) => episode.journey.status === "PUBLISHED").map((episode) => episode.journey.id)
    ),
  ];
  await ensureFreshJourneyScores(publishedJourneyIds);
  const freshScores = publishedJourneyIds.length > 0
    ? await prisma.journey.findMany({
        where: { id: { in: publishedJourneyIds } },
        select: { id: true, journeyScore: true },
      })
    : [];
  const scoreByJourneyId = new Map(freshScores.map((journey) => [journey.id, journey.journeyScore]));

  const items = selected.map((episode) => ({
    episodeId: episode.id,
    journeyId: episode.journey.id,
    title: episode.title,
    coverUrl: episode.posterKey ?? episode.journey.coverUrl,
    category: episode.journey.category,
    creatorName: episode.journey.creator.displayName,
    createdAt: episode.createdAt,
    journeyScore: scoreByJourneyId.get(episode.journey.id),
  }));
  return withResolvedCoverUrls(items);
}
