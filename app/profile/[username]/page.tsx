import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getImagePlaybackUrl } from "@/lib/r2";
import { FollowButton } from "@/components/profile/FollowButton";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/common/Reveal";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileTabs, type ProfileTab } from "@/components/profile/ProfileTabs";
import { FeaturedJourneySection } from "@/components/profile/FeaturedJourneySection";
import { AboutCard } from "@/components/profile/AboutCard";
import { JourneyStatsCard } from "@/components/profile/JourneyStatsCard";
import { FeedPhotoItem } from "@/components/profile/FeedPhotoItem";
import { MessageButton } from "@/components/profile/MessageButton";
import { EditProfileButton } from "@/components/profile/EditProfileButton";
import { EpisodeReorderSection } from "@/components/profile/EpisodeReorderSection";
import { getCreatorFeed } from "@/lib/profile/creatorFeed";
import { getEpisodeTimeline } from "@/lib/journey/episodeTimeline";
import { computeTrustScore, getCreatorTrustInputs } from "@/lib/profile/trustScore";
import { getFeaturedJourney } from "@/lib/profile/featuredJourney";
import { PUBLICLY_REACHABLE_JOURNEY_STATUSES, promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
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
  if (value === "journeys") return value;
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

  await promoteExpiredDiscoveryJourneys();
  const creator = await prisma.creator.findUnique({ where: { userId: user.id } });

  // Journey live (pubblicati o in Discovery Phase) sono mostrati insieme a quelli archiviati:
  // archiviare un Journey lo ritira dalla gestione attiva, ma resta visibile sul profilo pubblico
  // (mai cancellato).
  const journeys = creator
    ? await prisma.journey.findMany({
        where: { creatorId: creator.id, status: { in: PUBLICLY_REACHABLE_JOURNEY_STATUSES }, deletedAt: null },
        orderBy: { createdAt: "desc" },
      })
    : [];
  // Un creator può avere più Journey live in parallelo (vedi 00-project-context.md, sezione
  // "Archiviazione del Journey"): quello "in evidenza" è quello con l'episodio più recente.
  const liveJourneys = journeys.filter((journey) => journey.status === "PUBLISHED" || journey.status === "DISCOVERY");
  const featuredJourney = await getFeaturedJourney(liveJourneys);

  const session = await getCurrentSession();
  const isOwnProfile = session?.user.id === user.id;
  const isLoggedIn = Boolean(session);

  // User.avatarUrl/coverUrl salvano la chiave R2, non un URL pubblico: si risolve in un
  // link temporaneo a ogni caricamento pagina, stesso pattern già usato per i video (lib/r2.ts).
  const [avatarUrl, coverUrl] = await Promise.all([
    user.avatarUrl ? getImagePlaybackUrl(user.avatarUrl) : Promise.resolve(null),
    user.coverUrl ? getImagePlaybackUrl(user.coverUrl) : Promise.resolve(null),
  ]);

  // Follow è persona-segue-persona (vedi 00-project-context.md, sezione "Modello utente
  // unico"): ogni profilo è seguibile, non solo quello di un creator.
  const followersCount = await prisma.follow.count({ where: { followingId: user.id } });
  const isFollowing =
    session && !isOwnProfile
      ? Boolean(
          await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } },
          })
        )
      : false;

  const stats = creator
    ? await getProfileStats({
        creatorId: creator.id,
        journeys,
        publishedJourneyIds: liveJourneys.map((journey) => journey.id),
      })
    : { publishedEpisodesCount: 0, totalViews: 0, likesReceived: 0, completionRate: null };

  const trustScore = computeTrustScore(
    creator ? await getCreatorTrustInputs(creator.id, followersCount) : {
      followersCount,
      averageJourneyScore: 0,
      hasLiveJourney: false,
      confirmedReportsCount: 0,
    }
  );

  let feedItems = null;
  let isDemoFeed = false;
  if (activeTab === "overview" && creator) {
    const realFeed = await getCreatorFeed({ creatorId: creator.id, viewerUserId: session?.user.id ?? null });
    isDemoFeed = realFeed.length === 0;
    feedItems = isDemoFeed ? DEMO_FEED_ITEMS : realFeed;
  }

  // Drag & drop per riordinare gli episodi: solo sul proprio Profilo, solo per il Journey in
  // evidenza (prima viveva nella Dashboard, vedi components/profile/EpisodeReorderSection.tsx).
  const reorderGroups =
    activeTab === "overview" && isOwnProfile && featuredJourney
      ? (await getEpisodeTimeline(featuredJourney.id)).groups
      : [];

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
              <FollowButton
                userId={user.id}
                initialFollowersCount={followersCount}
                initialIsFollowing={isFollowing}
                isLoggedIn={isLoggedIn}
              />
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
                {featuredJourney && (
                  <Reveal>
                    <FeaturedJourneySection journey={featuredJourney} />
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
                    {featuredJourney && (
                      <p className="mt-1 text-sm text-ink-muted">{featuredJourney.title}</p>
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
                            ) : journey.status === "DISCOVERY" ? (
                              <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">
                                Discovering
                              </span>
                            ) : journey.id === featuredJourney?.id ? (
                              <span className="rounded-full bg-ember px-2.5 py-1 text-[11px] font-semibold text-white">
                                Featured
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
  publishedJourneyIds,
}: {
  creatorId: string;
  journeys: { id: string; status: string; viewsCount: number }[];
  publishedJourneyIds: string[];
}) {
  const [publishedEpisodesCount, allEpisodeIds, allUpdateIds, journeyProgressRows] = await Promise.all([
    prisma.episode.count({
      where: { deletedAt: null, journeyId: { in: publishedJourneyIds } },
    }),
    prisma.episode.findMany({
      where: { deletedAt: null, journeyId: { in: journeys.map((journey) => journey.id) } },
      select: { id: true },
    }),
    prisma.update.findMany({ where: { creatorId }, select: { id: true } }),
    // Completion rate aggregato su tutti i Journey pubblicati (prima solo sul singolo Journey
    // attivo): con più Journey attivi in parallelo è la lettura più corretta dello stato reale.
    // Il completamento vive per episodio (EpisodeProgress): un lettore conta come "completato" su
    // un Journey se ha finito l'episodio a cui si trova (currentEpisodeId).
    publishedJourneyIds.length > 0
      ? prisma.journeyProgress.findMany({
          where: { journeyId: { in: publishedJourneyIds }, currentEpisodeId: { not: null } },
          select: { userId: true, currentEpisodeId: true },
        })
      : Promise.resolve([]),
  ]);

  const likeTargetIds = [...allEpisodeIds.map((episode) => episode.id), ...allUpdateIds.map((update) => update.id)];
  const likesReceived =
    likeTargetIds.length > 0 ? await prisma.like.count({ where: { targetId: { in: likeTargetIds } } }) : 0;

  const totalViews = journeys.reduce((sum, journey) => sum + journey.viewsCount, 0);

  const completedEpisodeProgress =
    journeyProgressRows.length > 0
      ? await prisma.episodeProgress.findMany({
          where: {
            completedAt: { not: null },
            OR: journeyProgressRows.map((row) => ({ userId: row.userId, episodeId: row.currentEpisodeId! })),
          },
          select: { userId: true, episodeId: true },
        })
      : [];
  const completedKeys = new Set(completedEpisodeProgress.map((row) => `${row.userId}:${row.episodeId}`));

  const completionRate =
    journeyProgressRows.length > 0
      ? Math.round(
          (journeyProgressRows.filter((row) => completedKeys.has(`${row.userId}:${row.currentEpisodeId}`)).length /
            journeyProgressRows.length) *
            100
        )
      : null;

  return { publishedEpisodesCount, totalViews, likesReceived, completionRate };
}
