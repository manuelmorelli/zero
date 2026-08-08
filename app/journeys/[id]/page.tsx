import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getEpisodeTimeline } from "@/lib/journey/episodeTimeline";
import { FollowButton } from "@/components/creator/FollowButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/common/Reveal";

export default async function PublicJourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const journey = await prisma.journey.findUnique({
    where: { id },
    include: { creator: true },
  });

  if (!journey || journey.deletedAt || (journey.status !== "PUBLISHED" && journey.status !== "ARCHIVED"))
    notFound();

  // Contatore semplice per "Total Views" nel Profilo pubblico: nessuna deduplica per
  // visitatore/sessione nell'MVP, coerente con l'approccio minimo già scelto altrove.
  void prisma.journey.update({ where: { id: journey.id }, data: { viewsCount: { increment: 1 } } }).catch(() => {});

  const { flatEpisodes } = await getEpisodeTimeline(journey.id);
  const lastEpisode = flatEpisodes.at(-1) ?? null;

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
    <main>
      <PageHeader />

      <div className="mx-auto max-w-2xl px-6 py-14">
        <Reveal>
          <Link
            href={`/journeys/${journey.id}/episodes`}
            className="group relative block aspect-[2/1] w-full overflow-hidden rounded-xl bg-surface-2"
          >
            {journey.coverUrl ? (
              <Image
                src={journey.coverUrl}
                alt={journey.title}
                fill
                sizes="(min-width: 768px) 672px, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                preload
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
          </Link>

          <div className="mt-6 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-extrabold tracking-tight">{journey.title}</h1>
            {journey.status === "ARCHIVED" && (
              <span className="shrink-0 rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Archived
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-ink-muted">by {journey.creator.displayName}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/journeys/${journey.id}/episodes`}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
            >
              Watch episodes {flatEpisodes.length > 0 && `(${flatEpisodes.length})`} →
            </Link>
            {lastEpisode && (
              <Link
                href={`/journeys/${journey.id}/episodes#${lastEpisode.id}`}
                className="text-sm font-medium text-ink-muted underline underline-offset-2 transition-colors hover:text-ink"
              >
                Jump to latest episode
              </Link>
            )}
          </div>

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
        </Reveal>
      </div>
    </main>
  );
}
