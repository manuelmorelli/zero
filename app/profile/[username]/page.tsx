import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getImagePlaybackUrl } from "@/lib/r2";
import { FollowButton } from "@/components/creator/FollowButton";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { UpdateCard } from "@/components/journey/UpdateCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/common/Reveal";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileTabs, type ProfileTab } from "@/components/profile/ProfileTabs";
import { ActiveJourneySection } from "@/components/profile/ActiveJourneySection";
import { AboutCard } from "@/components/profile/AboutCard";
import { JourneyStatsCard } from "@/components/profile/JourneyStatsCard";
import { FeedPhotoItem } from "@/components/profile/FeedPhotoItem";
import { MessageButton } from "@/components/profile/MessageButton";
import { EditProfileButton } from "@/components/profile/EditProfileButton";
import { EpisodeReorderSection } from "@/components/profile/EpisodeReorderSection";
import { getCreatorFeed } from "@/lib/profile/creatorFeed";
import { getEpisodeTimeline } from "@/lib/journey/episodeTimeline";
import { computeTrustScore } from "@/lib/profile/trustScore";
import { DEMO_FEED_ITEMS } from "@/lib/demo/demoProfile";
import Link from "next/link";

// L'username non è ancora impostabile da UI: come fallback temporaneo si accetta
// anche l'id dell'utente nello stesso segmento di rotta, finché non esiste una
// gestione reale degli username. Nessuna nuova regola di business introdotta.
async function findUserByUsernameOrId(usernameOrId: string) {
  const byUsername = await prisma.user.findUnique({ where: { username: usernameOrId } });
  if (byUsername) return byUsername;
  return prisma.user.findUnique({ where: { id: usernameOrId } });
}

function parseTab(value: string | undefined): ProfileTab {
  if (value === "journeys" || value === "updates") return value;
  return "overview";
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const { tab: tabParam } = await searchParams;
  const activeTab = parseTab(tabParam);

  const user = await findUserByUsernameOrId(username);
  if (!user) notFound();

  const creator = await prisma.creator.findUnique({ where: { userId: user.id } });

  // Published Journeys are shown alongside archived ones: archiving retires a Journey
  // from active management, but it stays visible on the public profile (never deleted).
  const journeys = creator
    ? await prisma.journey.findMany({
        where: { creatorId: creator.id, status: { in: ["PUBLISHED", "ARCHIVED"] }, deletedAt: null },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const activeJourney = journeys.find((journey) => journey.status === "PUBLISHED") ?? null;

  const session = await getCurrentSession();
  const isOwnProfile = session?.user.id === user.id;
  const isLoggedIn = Boolean(session);

  // User.avatarUrl/coverUrl salvano la chiave R2, non un URL pubblico: si risolve in un
  // link temporaneo a ogni caricamento pagina, stesso pattern già usato per i video (lib/r2.ts).
  const [avatarUrl, coverUrl] = await Promise.all([
    user.avatarUrl ? getImagePlaybackUrl(user.avatarUrl) : Promise.resolve(null),
    user.coverUrl ? getImagePlaybackUrl(user.coverUrl) : Promise.resolve(null),
  ]);

  const followersCount = creator ? await prisma.follow.count({ where: { creatorId: creator.id } }) : 0;
  const isFollowing =
    creator && session && !isOwnProfile
      ? Boolean(
          await prisma.follow.findUnique({
            where: { userId_creatorId: { userId: session.user.id, creatorId: creator.id } },
          })
        )
      : false;

  const stats = creator
    ? await getProfileStats({ creatorId: creator.id, journeys, activeJourneyId: activeJourney?.id ?? null })
    : { publishedEpisodesCount: 0, totalViews: 0, likesReceived: 0, completionRate: null };

  const trustScore = computeTrustScore({
    followersCount,
    publishedEpisodesCount: stats.publishedEpisodesCount,
    hasActivePublishedJourney: activeJourney !== null,
  });

  let feedItems = null;
  let isDemoFeed = false;
  if (activeTab === "overview" && creator) {
    const realFeed = await getCreatorFeed({ creatorId: creator.id, viewerUserId: session?.user.id ?? null });
    isDemoFeed = realFeed.length === 0;
    feedItems = isDemoFeed ? DEMO_FEED_ITEMS : realFeed;
  }

  // Drag & drop per riordinare gli episodi: solo sul proprio Profilo, solo per il Journey attivo
  // (prima viveva nella Dashboard, vedi components/profile/EpisodeReorderSection.tsx).
  const reorderGroups =
    activeTab === "overview" && isOwnProfile && activeJourney
      ? (await getEpisodeTimeline(activeJourney.id)).groups
      : [];

  let activeUpdates: { id: string; creatorId: string; creatorName: string; content: string; publishedAt: Date }[] = [];
  if (activeTab === "updates" && creator) {
    const updates = await prisma.update.findMany({
      where: { creatorId: creator.id, archivedAt: { gt: new Date() } },
      orderBy: { publishedAt: "desc" },
    });
    activeUpdates = updates.map((update) => ({
      id: update.id,
      creatorId: creator.id,
      creatorName: creator.displayName,
      content: update.content,
      publishedAt: update.publishedAt,
    }));
  }

  return (
    <main>
      <PageHeader />

      <ProfileHero
        coverUrl={coverUrl}
        avatarUrl={avatarUrl}
        name={user.name}
        bio={user.bio}
        location={user.location}
        joinedAt={user.createdAt}
        trustScore={trustScore}
        journeysCount={journeys.length}
        followersCount={followersCount}
        stats={{
          episodesPublished: stats.publishedEpisodesCount,
          totalViews: stats.totalViews,
          likesReceived: stats.likesReceived,
          completionRate: stats.completionRate,
        }}
        actions={
          isOwnProfile ? (
            <>
              <EditProfileButton
                user={{
                  name: user.name,
                  username: user.username,
                  bio: user.bio,
                  location: user.location,
                  interests: user.interests,
                }}
                avatarUrl={avatarUrl}
                coverUrl={coverUrl}
              />
              <Link
                href={creator ? "/dashboard" : "/dashboard/new"}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink-muted"
              >
                {creator ? "Dashboard" : "Become a creator"}
              </Link>
            </>
          ) : (
            <>
              {creator && (
                <FollowButton
                  creatorId={creator.id}
                  initialFollowersCount={followersCount}
                  initialIsFollowing={isFollowing}
                  isLoggedIn={isLoggedIn}
                />
              )}
              <MessageButton name={user.name} />
            </>
          )
        }
      />

      <ProfileTabs basePath={`/profile/${username}`} activeTab={activeTab} />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10">
          <div className="min-w-0 space-y-10">
            {activeTab === "overview" && (
              <>
                {activeJourney && (
                  <Reveal>
                    <ActiveJourneySection journey={activeJourney} />
                  </Reveal>
                )}

                {reorderGroups.length > 0 && (
                  <Reveal delayMs={40}>
                    <EpisodeReorderSection groups={reorderGroups} />
                  </Reveal>
                )}

                <Reveal delayMs={80}>
                  <section>
                    <h2 className="text-lg font-bold tracking-tight text-ink">Latest Episodes</h2>
                    {activeJourney && (
                      <p className="mt-1 text-sm text-ink-muted">{activeJourney.title}</p>
                    )}

                    {feedItems && feedItems.length > 0 ? (
                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        {feedItems.map((item, index) => (
                          <Reveal key={item.type === "episode" ? item.episodeId : item.updateId} delayMs={index * 60}>
                            <FeedPhotoItem item={item} isLoggedIn={isLoggedIn && !isDemoFeed} />
                          </Reveal>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-5 rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
                        {`${user.name} hasn't shared anything yet.`}
                      </p>
                    )}
                  </section>
                </Reveal>
              </>
            )}

            {activeTab === "journeys" && (
              <section>
                {journeys.length === 0 ? (
                  <p className="rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
                    {`${user.name} hasn't published any Journey yet.`}
                  </p>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {journeys.map((journey, index) => (
                      <Reveal key={journey.id} delayMs={index * 80}>
                        <JourneyCard
                          journey={{
                            id: journey.id,
                            title: journey.title,
                            coverUrl: journey.coverUrl,
                            category: journey.category,
                            creator: { displayName: creator?.displayName ?? user.name },
                            followersCount,
                          }}
                          badge={
                            journey.status === "ARCHIVED" ? (
                              <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">
                                Archived
                              </span>
                            ) : undefined
                          }
                        />
                      </Reveal>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "updates" && (
              <section>
                {activeUpdates.length === 0 ? (
                  <p className="rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
                    {`${user.name} doesn't have any active Updates right now.`}
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {activeUpdates.map((update, index) => (
                      <Reveal key={update.id} delayMs={index * 60}>
                        <UpdateCard update={update} />
                      </Reveal>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Su desktop About/Journey Stats vivono già sovrapposte alla copertina (ProfileHero):
              qui restano solo come fallback per schermi stretti, dove sovrapporle alla foto
              sarebbe illeggibile. */}
          <aside className="space-y-6 lg:hidden">
            <AboutCard name={user.name} bio={user.bio} />
            <JourneyStatsCard
              episodesPublished={stats.publishedEpisodesCount}
              totalViews={stats.totalViews}
              likesReceived={stats.likesReceived}
              completionRate={stats.completionRate}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* STATISTICHE PROFILO (sidebar "Journey Stats" + input del Trust Score) */
/* ------------------------------------------------------------------ */

async function getProfileStats({
  creatorId,
  journeys,
  activeJourneyId,
}: {
  creatorId: string;
  journeys: { id: string; status: string; viewsCount: number }[];
  activeJourneyId: string | null;
}) {
  const publishedJourneyIds = journeys.filter((journey) => journey.status === "PUBLISHED").map((journey) => journey.id);

  const [publishedEpisodesCount, allEpisodeIds, allUpdateIds, progressRows] = await Promise.all([
    prisma.episode.count({
      where: { deletedAt: null, journeyId: { in: publishedJourneyIds } },
    }),
    prisma.episode.findMany({
      where: { deletedAt: null, journeyId: { in: journeys.map((journey) => journey.id) } },
      select: { id: true },
    }),
    prisma.update.findMany({ where: { creatorId }, select: { id: true } }),
    activeJourneyId
      ? prisma.journeyProgress.findMany({ where: { journeyId: activeJourneyId }, select: { completedAt: true } })
      : Promise.resolve([]),
  ]);

  const likeTargetIds = [...allEpisodeIds.map((episode) => episode.id), ...allUpdateIds.map((update) => update.id)];
  const likesReceived =
    likeTargetIds.length > 0 ? await prisma.like.count({ where: { targetId: { in: likeTargetIds } } }) : 0;

  const totalViews = journeys.reduce((sum, journey) => sum + journey.viewsCount, 0);

  const completionRate =
    progressRows.length > 0
      ? Math.round((progressRows.filter((row) => row.completedAt !== null).length / progressRows.length) * 100)
      : null;

  return { publishedEpisodesCount, totalViews, likesReceived, completionRate };
}
