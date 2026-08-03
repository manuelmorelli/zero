import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getVideoPlaybackUrl } from "@/lib/r2";
import { EpisodeCard } from "@/components/journey/EpisodeCard";
import { FollowButton } from "@/components/creator/FollowButton";
import { BackButton } from "@/components/common/BackButton";

export default async function PublicJourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const journey = await prisma.journey.findUnique({
    where: { id },
    include: {
      creator: true,
      chapters: {
        where: { deletedAt: null },
        orderBy: { order: "asc" },
        include: {
          episodes: { where: { deletedAt: null }, orderBy: { order: "asc" } },
        },
      },
      // Episodi senza capitolo: i Capitoli sono un livello organizzativo opzionale
      // (05_Journey.md), quindi il Journey deve leggersi anche solo come questa lista.
      episodes: {
        where: { chapterId: null, deletedAt: null },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!journey || journey.deletedAt || (journey.status !== "PUBLISHED" && journey.status !== "ARCHIVED"))
    notFound();

  const episodesWithVideo = [
    ...journey.episodes,
    ...journey.chapters.flatMap((chapter) => chapter.episodes),
  ].filter((episode) => episode.videoKey);
  const playbackUrls = new Map(
    await Promise.all(
      episodesWithVideo.map(
        async (episode) => [episode.id, await getVideoPlaybackUrl(episode.videoKey!)] as const
      )
    )
  );

  const session = await getCurrentSession();
  const isOwnJourney = session?.user.id === journey.creator.userId;
  const followersCount = await prisma.follow.count({ where: { creatorId: journey.creatorId } });
  const isFollowing =
    session && !isOwnJourney
      ? Boolean(
          await prisma.follow.findUnique({
            where: { userId_creatorId: { userId: session.user.id, creatorId: journey.creatorId } },
          })
        )
      : false;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="font-sans text-xl font-extrabold tracking-tight">
          ZERO
        </Link>
        <BackButton fallbackHref="/" />
      </div>

      <div className="mt-8 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">{journey.title}</h1>
        {journey.status === "ARCHIVED" && (
          <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-semibold text-ink-muted">
            Archived
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-muted">by {journey.creator.displayName}</p>

      {!isOwnJourney && (
        <div className="mt-4">
          <FollowButton
            creatorId={journey.creatorId}
            initialFollowersCount={followersCount}
            initialIsFollowing={isFollowing}
            isLoggedIn={Boolean(session)}
          />
        </div>
      )}

      {journey.description && (
        <p className="mt-4 text-sm text-ink-muted">{journey.description}</p>
      )}

      {(journey.category || journey.tags.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {journey.category && (
            <span className="rounded-full bg-surface-2 px-3 py-1 text-xs text-ink-muted">
              {journey.category}
            </span>
          )}
          {journey.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-surface-2 px-3 py-1 text-xs text-ink-muted">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10 space-y-8">
        {journey.episodes.length === 0 && journey.chapters.length === 0 && (
          <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
            This Journey doesn&apos;t have any episodes yet.
          </p>
        )}

        {journey.episodes.length > 0 && (
          <div className="space-y-3">
            {journey.episodes.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} videoSrc={playbackUrls.get(episode.id)} />
            ))}
          </div>
        )}

        {journey.chapters.map((chapter) => (
          <div key={chapter.id}>
            <h2 className="text-sm font-semibold text-ink">{chapter.title}</h2>
            {chapter.description && (
              <p className="mt-1 text-sm text-ink-muted">{chapter.description}</p>
            )}

            <div className="mt-4 space-y-3">
              {chapter.episodes.length === 0 && (
                <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
                  No episodes yet.
                </p>
              )}
              {chapter.episodes.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} videoSrc={playbackUrls.get(episode.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}