import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { withResolvedCoverUrls } from "@/lib/media/resolveCoverUrl";

export type ContinueJourneyItem = {
  journeyId: string;
  title: string;
  coverUrl: string | null;
  creatorName: string;
  episodeId: string | null;
  episodeTitle: string | null;
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
    include: { journey: { include: { creator: true } } },
  });

  const episodeIds = progresses
    .map((progress) => progress.currentEpisodeId)
    .filter((id): id is string => id !== null);

  const episodes = await prisma.episode.findMany({
    where: { id: { in: episodeIds }, deletedAt: null, publishedAt: { not: null } },
  });
  const episodeById = new Map(episodes.map((episode) => [episode.id, episode]));

  const items = progresses.map((progress) => {
    const episode = progress.currentEpisodeId ? episodeById.get(progress.currentEpisodeId) : undefined;
    return {
      journeyId: progress.journeyId,
      title: progress.journey.title,
      coverUrl: episode?.posterKey ?? progress.journey.coverUrl,
      creatorName: progress.journey.creator.displayName,
      episodeId: episode?.id ?? null,
      episodeTitle: episode?.title ?? null,
    };
  });
  return withResolvedCoverUrls(items);
}
