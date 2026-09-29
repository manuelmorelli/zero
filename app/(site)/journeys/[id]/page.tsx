import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListVideo, Play } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getViewerSession } from "@/lib/session";
import { getEpisodeTimeline } from "@/lib/journey/episodeTimeline";
import { isPubliclyReachableJourneyStatus, promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import { computeTrustScore, getCreatorTrustInputs } from "@/lib/profile/trustScore";
import { resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import { formatDuration } from "@/lib/format/duration";
import { FollowButton } from "@/components/profile/FollowButton";
import { ShareButton } from "@/components/common/ShareButton";
import { ReportButton } from "@/components/common/ReportButton";
import { Avatar } from "@/components/ui/avatar";
import { TrustScoreBadge } from "@/components/common/TrustScoreBadge";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/button";
import { Reveal } from "@/components/common/Reveal";
import type { TimelineEpisode } from "@/lib/journey/episodeTimeline";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { NOTICE, PANEL, ROW } from "@/components/ui/panel";
import { PageTitle, SectionTitle } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

export default async function PublicJourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await promoteExpiredDiscoveryJourneys();
  const journey = await prisma.journey.findUnique({
    where: { id },
    include: { creator: true },
  });

  if (!journey || journey.deletedAt || !isPubliclyReachableJourneyStatus(journey.status)) notFound();

  // Contatore semplice per "Total Views" nel Profilo pubblico: nessuna deduplica per
  // visitatore/sessione nell'MVP, coerente con l'approccio minimo già scelto altrove.
  void prisma.journey.update({ where: { id: journey.id }, data: { viewsCount: { increment: 1 } } }).catch(() => {});

  const journeyCoverUrl = await resolveCoverUrl(journey.coverUrl);

  const session = await getViewerSession();
  const { groups, flatEpisodes } = await getEpisodeTimeline(journey.id, { userId: session?.user.id });
  const firstEpisode = flatEpisodes.at(0) ?? null;

  const isOwnJourney = session?.user.id === journey.creator.userId;
  // Follow è persona-segue-persona (vedi 00-project-context.md, sezione "Modello utente
  // unico"): si segue la persona dietro il creator, non un "Follow di Creator" a parte.
  const followersCount = await prisma.follow.count({ where: { followingId: journey.creator.userId } });
  const isFollowing =
    session && !isOwnJourney
      ? Boolean(
          await prisma.follow.findUnique({
            where: {
              followerId_followingId: { followerId: session.user.id, followingId: journey.creator.userId },
            },
          })
        )
      : false;

  const trustScore = computeTrustScore(await getCreatorTrustInputs(journey.creator.id, followersCount));

  return (
    <main>

      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <Reveal>
          <div className={cn(PANEL, "grid gap-4 md:grid-cols-2 md:p-5")}>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-surface-2">
              {journeyCoverUrl ? (
                <Image
                  src={journeyCoverUrl}
                  alt={journey.title}
                  fill
                  sizes="(min-width: 768px) 660px, 100vw"
                  className="object-cover"
                  preload
                />
              ) : (
                <div className="absolute inset-0 cover-placeholder" />
              )}
              <div className="absolute inset-0 card-scrim" />
              {journey.category && (
                <span className="absolute bottom-3 left-3 inline-flex rounded-full border border-border bg-overlay-soft px-2.5 py-1 text-sm font-medium text-on-photo backdrop-blur-md">
                  {journey.category}
                </span>
              )}
              {journey.status === "ARCHIVED" && (
                <span className="absolute right-3 top-3 rounded-full border border-border bg-scrim px-2.5 py-1 text-sm font-semibold uppercase tracking-wider">
                  Archived
                </span>
              )}
            </div>

            <div className="flex flex-col justify-between gap-4">
              <div>
                <p className="text-sm tracking-[0.22em] text-ink-muted uppercase">
                  Journey{journey.category ? ` · ${journey.category}` : ""}
                </p>
                <PageTitle className="mt-1.5">
                  {journey.title}
                </PageTitle>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
                  <Link
                    href={`/profile/${journey.creator.userId}`}
                    className="flex min-w-0 items-center gap-2 transition-colors hover:text-ember"
                  >
                    <Avatar name={journey.creator.displayName} size="sm" />
                    <span className="truncate">{journey.creator.displayName}</span>
                  </Link>
                  {trustScore !== null && <TrustScoreBadge score={trustScore} />}
                  <span className="inline-flex items-center gap-1.5">
                    <ListVideo className="h-3.5 w-3.5" aria-hidden="true" />
                    {flatEpisodes.length} {flatEpisodes.length === 1 ? "Episode" : "Episodes"}
                  </span>
                </div>
                {journey.description && (
                  <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-muted">
                    {journey.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {!isOwnJourney && (
                  <FollowButton
                    userId={journey.creator.userId}
                    initialIsFollowing={isFollowing}
                    isLoggedIn={Boolean(session)}
                  />
                )}
                {firstEpisode && (
                  <ButtonSecondary
                    href={`/journeys/${journey.id}/episodes/${firstEpisode.id}`}
                    className="px-4 py-2 text-sm"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    Episode 1
                  </ButtonSecondary>
                )}
                <ShareButton
                  path={`/journeys/${journey.id}`}
                  label={journey.title}
                  updateCaption={
                    isOwnJourney
                      ? `New Journey: ${journey.title}`
                      : `Check out this Journey by ${journey.creator.displayName}: ${journey.title}`
                  }
                  linkedJourneyId={journey.id}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-ember transition-opacity hover:opacity-80"
                />
                {!isOwnJourney && session && <ReportButton targetType="JOURNEY" targetId={journey.id} />}
              </div>
            </div>
          </div>
        </Reveal>

        <section className="mt-5">
          <SectionTitle>Episodes</SectionTitle>
          {flatEpisodes.length === 0 ? (
            <p className={`mt-3 ${NOTICE}`}>
              This Journey doesn&apos;t have any episodes yet.
            </p>
          ) : (
            <div className="mt-3 space-y-5">
              {groups.map((group) => (
                <div key={group.chapterId ?? "loose"}>
                  {group.chapterTitle && (
                    <p className="text-sm tracking-[0.22em] text-ink-muted uppercase">
                      {group.chapterTitle}
                    </p>
                  )}
                  <ul className="mt-2 space-y-2">
                    {group.episodes.map((episode) => (
                      <EpisodeRow key={episode.id} episode={episode} journeyId={journey.id} coverUrl={journeyCoverUrl} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EpisodeRow({
  episode,
  journeyId,
  coverUrl,
}: {
  episode: TimelineEpisode;
  journeyId: string;
  coverUrl: string | null;
}) {
  return (
    <li>
      <Link
        href={`/journeys/${journeyId}/episodes/${episode.id}`}
        id={episode.id}
        className={cn(ROW, "group flex w-full max-w-[420px] scroll-mt-24 items-center gap-3 p-2 text-left hover:-translate-y-0.5")}
      >
        <span className="relative aspect-4/3 w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2 sm:w-44">
          {episode.posterUrl || coverUrl ? (
            <Image
              src={episode.posterUrl || coverUrl!}
              alt=""
              fill
              sizes="176px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 cover-placeholder transition-transform duration-700 group-hover:scale-105" />
          )}
          <div className="absolute inset-0 card-scrim" />
          <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-scrim backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
              <Play className="h-3 w-3 translate-x-[1px] fill-current text-ember" aria-hidden="true" />
            </span>
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="block text-sm tracking-[0.18em] text-ink-muted uppercase">
              Episode {episode.number}
            </span>
            {episode.progress?.completedAt && (
              <span className="text-sm font-semibold text-ember">· Completed</span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-sm font-semibold transition-colors group-hover:text-ember">
            {episode.title}
          </span>
          {episode.durationSec !== null && (
            <span className="mt-0.5 block text-sm text-ink-muted">{formatDuration(episode.durationSec)}</span>
          )}
        </span>
      </Link>
    </li>
  );
}
