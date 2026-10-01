import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";
import { resolveAvatarUrl, resolveCoverUrl } from "@/lib/media/resolveCoverUrl";

export type ContinueJourneyItem = {
  journeyId: string;
  title: string;
  coverUrl: string | null;
  category: string | null;
  creatorName: string;
  creatorAvatarUrl: string | null;
  episodeId: string | null;
  episodeTitle: string | null;
  /** Journey Score (0-100): assente se il Journey è ancora in Discovery Phase (vedi
   * lib/scoring/journeyScore.ts). */
  journeyScore?: number;
};

/** I Journey che l'utente sta seguendo passo passo (ha già un avanzamento salvato). Pensata
 * per la riga "Continue Your Journey", che vive sulla home del Profilo (non sulla Home). */
export async function getContinueJourneys(
  session: Awaited<ReturnType<typeof getCurrentSession>>
): Promise<ContinueJourneyItem[]> {
  if (!session) return [];

  const progresses = await prisma.journeyProgress.findMany({
    where: {
      userId: session.user.id,
      journey: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null },
    },
    orderBy: { updatedAt: "desc" },
    include: { journey: { include: { creator: { include: { user: { select: { avatarUrl: true } } } } } } },
  });

  const episodeIds = progresses
    .map((progress) => progress.currentEpisodeId)
    .filter((id): id is string => id !== null);

  const episodes = await prisma.episode.findMany({
    where: { id: { in: episodeIds }, deletedAt: null, publishedAt: { not: null } },
  });
  const episodeById = new Map(episodes.map((episode) => [episode.id, episode]));

  // Il badge del punteggio si mostra solo per i Journey già PUBLISHED: quelli in Discovery Phase
  // non partecipano al Journey Score (vedi lib/scoring/journeyScore.ts).
  const publishedIds = progresses
    .filter((progress) => progress.journey.status === "PUBLISHED")
    .map((progress) => progress.journeyId);
  await ensureFreshJourneyScores(publishedIds);
  const freshScores = publishedIds.length > 0
    ? await prisma.journey.findMany({ where: { id: { in: publishedIds } }, select: { id: true, journeyScore: true } })
    : [];
  const scoreByJourneyId = new Map(freshScores.map((journey) => [journey.id, journey.journeyScore]));

  const items = progresses.map((progress) => {
    const episode = progress.currentEpisodeId ? episodeById.get(progress.currentEpisodeId) : undefined;
    return {
      journeyId: progress.journeyId,
      title: progress.journey.title,
      coverUrl: episode?.posterKey ?? progress.journey.coverUrl,
      category: progress.journey.category,
      creatorName: progress.journey.creator.displayName,
      creatorAvatarUrl: progress.journey.creator.user.avatarUrl,
      episodeId: episode?.id ?? null,
      episodeTitle: episode?.title ?? null,
      journeyScore: scoreByJourneyId.get(progress.journeyId),
    };
  });
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      coverUrl: await resolveCoverUrl(item.coverUrl),
      creatorAvatarUrl: await resolveAvatarUrl(item.creatorAvatarUrl),
    }))
  );
}
