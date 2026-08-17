import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getVideoPlaybackUrl } from "@/lib/r2";
import { getEpisodeTimeline } from "@/lib/journey/episodeTimeline";
import { isPubliclyReachableJourneyStatus, promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import { computeTrustScore, getCreatorTrustInputs } from "@/lib/profile/trustScore";
import { resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import { Header } from "@/components/layout/Header";
import { EpisodePlayer } from "@/components/journey/EpisodePlayer";
import { UpNextList } from "@/components/journey/UpNextList";

export default async function EpisodePlayerPage({
  params,
}: {
  params: Promise<{ id: string; episodeId: string }>;
}) {
  const { id, episodeId } = await params;

  await promoteExpiredDiscoveryJourneys();
  const journey = await prisma.journey.findUnique({
    where: { id },
    include: { creator: true },
  });
  if (!journey || journey.deletedAt || !isPubliclyReachableJourneyStatus(journey.status)) notFound();

  const episode = await prisma.episode.findFirst({
    where: { id: episodeId, journeyId: journey.id, deletedAt: null },
  });
  if (!episode) notFound();

  const session = await getCurrentSession();
  const userId = session?.user.id;

  const [{ flatEpisodes }, progress, likeCount, viewerLike, followersCount] = await Promise.all([
    getEpisodeTimeline(journey.id, { userId }),
    userId ? prisma.episodeProgress.findUnique({ where: { userId_episodeId: { userId, episodeId } } }) : null,
    prisma.like.count({ where: { targetType: "EPISODE", targetId: episodeId } }),
    userId
      ? prisma.like.findUnique({ where: { userId_targetType_targetId: { userId, targetType: "EPISODE", targetId: episodeId } } })
      : null,
    prisma.follow.count({ where: { followingId: journey.creator.userId } }),
  ]);

  const trustScore = computeTrustScore(await getCreatorTrustInputs(journey.creator.id, followersCount));
  const currentNumber = flatEpisodes.find((item) => item.id === episodeId)?.number ?? 1;
  const videoSrc = episode.videoKey ? await getVideoPlaybackUrl(episode.videoKey) : null;
  const journeyCoverUrl = await resolveCoverUrl(journey.coverUrl);

  return (
    <main>
      <Header />

      <div className="mx-auto grid max-w-[1400px] gap-5 px-5 pb-10 pt-24 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <EpisodePlayer
          journeyId={journey.id}
          journeyTitle={journey.title}
          journeyCategory={journey.category}
          creator={{ userId: journey.creator.userId, displayName: journey.creator.displayName }}
          trustScore={trustScore}
          episode={{
            id: episode.id,
            title: episode.title,
            caption: episode.caption,
            number: currentNumber,
            videoSrc,
            posterUrl: journeyCoverUrl,
          }}
          initialPositionSec={progress?.positionSec ?? 0}
          initialCompleted={Boolean(progress?.completedAt)}
          initialLikeCount={likeCount}
          initialIsLiked={Boolean(viewerLike)}
          isLoggedIn={Boolean(session)}
        />

        <UpNextList
          journeyId={journey.id}
          journeyTitle={journey.title}
          coverUrl={journeyCoverUrl}
          episodes={flatEpisodes}
          activeEpisodeId={episode.id}
        />
      </div>
    </main>
  );
}
