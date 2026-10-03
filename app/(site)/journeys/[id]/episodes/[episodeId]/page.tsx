import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getViewerSession } from "@/lib/session";
import { getImagePlaybackUrl, getVideoPlaybackUrl } from "@/lib/r2";
import { getEpisodeTimeline } from "@/lib/journey/episodeTimeline";
import { isPubliclyReachableJourneyStatus, promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import { computeTrustScore, getCreatorTrustInputs } from "@/lib/profile/trustScore";
import { resolveAvatarUrl, resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import { EpisodePlayer } from "@/components/journey/EpisodePlayer";
import { UpNextList } from "@/components/journey/UpNextList";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { cn } from "@/lib/utils";

export default async function EpisodePlayerPage({
  params,
}: {
  params: Promise<{ id: string; episodeId: string }>;
}) {
  const { id, episodeId } = await params;

  await promoteExpiredDiscoveryJourneys();
  const journey = await prisma.journey.findUnique({
    where: { id },
    include: { creator: { include: { user: { select: { avatarUrl: true } } } } },
  });
  if (!journey || journey.deletedAt || !isPubliclyReachableJourneyStatus(journey.status)) notFound();

  const episode = await prisma.episode.findFirst({
    where: { id: episodeId, journeyId: journey.id, deletedAt: null, publishedAt: { not: null } },
  });
  if (!episode) notFound();

  const session = await getViewerSession();
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
  // Versione leggera per connessioni lente (Cloudflare Stream): usata solo quando pronta, il
  // player ricade sull'originale (videoSrc) finché non lo è — vedi components/journey/EpisodePlayer.
  const lightVideoSrc = episode.lightVideoStatus === "READY" ? episode.lightVideoPlaybackUrl : null;
  const [journeyCoverUrl, episodePosterUrl, creatorAvatarUrl] = await Promise.all([
    resolveCoverUrl(journey.coverUrl),
    episode.posterKey ? getImagePlaybackUrl(episode.posterKey) : Promise.resolve(null),
    resolveAvatarUrl(journey.creator.user.avatarUrl),
  ]);

  return (
    <main>

      <div className={cn(PAGE_WIDTH.wide, "grid gap-5 pb-10 pt-24 lg:grid-cols-[minmax(0,1fr)_340px]")}>
        <EpisodePlayer
          journeyId={journey.id}
          journeyTitle={journey.title}
          journeyCategory={journey.category}
          creator={{ userId: journey.creator.userId, displayName: journey.creator.displayName, avatarUrl: creatorAvatarUrl }}
          trustScore={trustScore}
          episode={{
            id: episode.id,
            title: episode.title,
            caption: episode.caption,
            isSponsored: episode.isSponsored,
            number: currentNumber,
            videoSrc,
            lightVideoSrc,
            posterUrl: episodePosterUrl ?? journeyCoverUrl,
          }}
          initialPositionSec={progress?.positionSec ?? 0}
          initialCompleted={Boolean(progress?.completedAt)}
          initialLikeCount={likeCount}
          initialIsLiked={Boolean(viewerLike)}
          isLoggedIn={Boolean(session)}
          isOwnContent={session?.user.id === journey.creator.userId}
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
