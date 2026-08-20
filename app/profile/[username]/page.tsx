import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getImagePlaybackUrl } from "@/lib/r2";
import { FollowButton } from "@/components/profile/FollowButton";
import { LikeButton } from "@/components/journey/LikeButton";
import { ContentCard } from "@/components/profile/ContentCard";
import { ShareIconButton } from "@/components/profile/ShareIconButton";
import { JourneyCardMenu } from "@/components/profile/JourneyCardMenu";
import { Header } from "@/components/layout/Header";
import { Reveal } from "@/components/common/Reveal";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileTabs, type ProfileTab } from "@/components/profile/ProfileTabs";
import { FeaturedJourneySection } from "@/components/profile/FeaturedJourneySection";
import { AboutCard } from "@/components/profile/AboutCard";
import { MessageButton } from "@/components/profile/MessageButton";
import { EditProfileButton } from "@/components/profile/EditProfileButton";
import { ShareProfileButton } from "@/components/profile/ShareProfileButton";
import { getCreatorFeed } from "@/lib/profile/creatorFeed";
import { getCreatorActiveStory } from "@/lib/discovery/stories";
import { canMessage } from "@/lib/messaging";
import { computeTrustScore, getCreatorTrustInputs } from "@/lib/profile/trustScore";
import { getFeaturedJourney } from "@/lib/profile/featuredJourney";
import { PUBLICLY_REACHABLE_JOURNEY_STATUSES, promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import { withResolvedCoverUrls } from "@/lib/media/resolveCoverUrl";
import { DEMO_FEED_ITEMS } from "@/lib/demo/demoProfile";

/** Quante Published Journeys mostrare in anteprima nell'Overview prima del link "View all"
 * verso la tab Journeys (che resta la lista completa, archiviati compresi). */
const PUBLISHED_JOURNEYS_PREVIEW_COUNT = 5;

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
    ? await withResolvedCoverUrls(
        await prisma.journey.findMany({
          where: { creatorId: creator.id, status: { in: PUBLICLY_REACHABLE_JOURNEY_STATUSES }, deletedAt: null },
          orderBy: { order: "asc" },
        })
      )
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
  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
  ]);
  const isFollowing =
    session && !isOwnProfile
      ? Boolean(
          await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } },
          })
        )
      : false;

  // Basta che una delle due persone segua l'altra per potersi scrivere (vedi
  // 00-project-context.md, sezione "Follow universale"), non serve il follow reciproco.
  const canMessageUser = session && !isOwnProfile ? await canMessage(session.user.id, user.id) : false;

  // Anello arancione sulla foto profilo quando questo creator ha un Update attivo, visibile a
  // chiunque visiti la pagina (non solo al proprietario) — vedi components/profile/ProfileAvatarStory.tsx.
  const activeStory = creator
    ? await getCreatorActiveStory({ creatorId: creator.id, viewerId: session?.user.id ?? null })
    : null;

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
  // "Recent Episodes" è scoped ai soli episodi (gli Update non hanno una pagina propria da
  // aprire — vengono mostrati altrove, nel visualizzatore a schermo intero della Hero).
  const episodeFeedItems = feedItems?.filter((item) => item.type === "episode") ?? [];

  return (
    <main>
      <Header />

      <ProfileHero
        coverUrl={coverUrl}
        avatarUrl={avatarUrl}
        name={user.name}
        username={user.username}
        location={user.location}
        joinedAt={user.createdAt}
        trustScore={trustScore}
        journeysCount={journeys.length}
        followersCount={followersCount}
        followingCount={followingCount}
        isOwnProfile={isOwnProfile}
        activeStory={activeStory}
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
                href="/dashboard"
                className="rounded-full border border-ember/50 bg-ember/15 px-5 py-2.5 text-sm font-semibold text-ember transition-colors hover:bg-ember/25"
              >
                Dashboard
              </Link>
              <ShareProfileButton />
            </>
          ) : (
            <>
              <FollowButton
                userId={user.id}
                initialFollowersCount={followersCount}
                initialIsFollowing={isFollowing}
                isLoggedIn={isLoggedIn}
              />
              {canMessageUser && <MessageButton userId={user.id} />}
            </>
          )
        }
      />

      <ProfileTabs basePath={`/profile/${username}`} activeTab={activeTab} />

      <div className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
        {activeTab === "overview" && (
          <>
            {/* 1. Journey in corso + Bio */}
            <Reveal>
              {featuredJourney ? (
                <div className="grid gap-4 lg:grid-cols-[minmax(0,34%)_minmax(0,32%)] lg:justify-between">
                  <FeaturedJourneySection journey={featuredJourney} />
                  <AboutCard name={user.name} bio={user.bio} interests={user.interests} />
                </div>
              ) : (
                <div className="max-w-md">
                  <AboutCard name={user.name} bio={user.bio} interests={user.interests} />
                </div>
              )}
            </Reveal>

            {/* 2. Recent Episodes */}
            <Reveal delayMs={40} className="mt-6 block">
              <section>
                <h2 className="text-lg font-bold tracking-tight text-ink">Recent Episodes</h2>

                {episodeFeedItems.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {episodeFeedItems.map((item, index) => (
                      <Reveal key={item.episodeId} delayMs={index * 60}>
                        <ContentCard
                          href={`/journeys/${item.journeyId}/episodes/${item.episodeId}`}
                          imageUrl={item.coverUrl}
                          imageAlt={item.title}
                          title={item.title}
                          category={item.category}
                          likeSlot={
                            <LikeButton
                              targetType="EPISODE"
                              targetId={item.episodeId}
                              initialLikeCount={item.likeCount}
                              initialIsLiked={item.isLiked}
                              isLoggedIn={isLoggedIn && !isDemoFeed}
                            />
                          }
                          menu={
                            isOwnProfile && !isDemoFeed ? (
                              <ShareIconButton
                                path={`/journeys/${item.journeyId}/episodes/${item.episodeId}`}
                                label={item.title}
                              />
                            ) : undefined
                          }
                        />
                      </Reveal>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
                    {`${user.name} hasn't shared any episode yet.`}
                  </p>
                )}
              </section>
            </Reveal>

            {/* 3. Published Journeys (anteprima, "View all" -> tab Journeys) */}
            <Reveal delayMs={120} className="mt-6 block">
              <section>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold tracking-tight text-ink">Published Journeys</h2>
                  {liveJourneys.length > PUBLISHED_JOURNEYS_PREVIEW_COUNT && (
                    <Link
                      href={`/profile/${username}?tab=journeys`}
                      className="text-sm text-ink-muted transition-colors hover:text-ember"
                    >
                      View all →
                    </Link>
                  )}
                </div>

                {liveJourneys.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {liveJourneys.slice(0, PUBLISHED_JOURNEYS_PREVIEW_COUNT).map((journey, index) => {
                      // Posizione nell'elenco completo (non nella sola anteprima): "Move" deve
                      // rispecchiare l'ordine reale, che include anche i Journey archiviati non
                      // mostrati qui.
                      const globalIndex = journeys.findIndex((item) => item.id === journey.id);
                      return (
                        <Reveal key={journey.id} delayMs={index * 60}>
                          <ContentCard
                            href={`/journeys/${journey.id}`}
                            imageUrl={journey.coverUrl}
                            imageAlt={journey.title}
                            title={journey.title}
                            category={journey.category}
                            status={journey.status === "DISCOVERY" ? "Discovery" : undefined}
                            trust={Math.round(journey.journeyScore)}
                            menu={
                              isOwnProfile ? (
                                <JourneyCardMenu
                                  journeyId={journey.id}
                                  title={journey.title}
                                  alreadyArchived={false}
                                  canMoveBack={globalIndex > 0}
                                  canMoveForward={globalIndex < journeys.length - 1}
                                />
                              ) : undefined
                            }
                          />
                        </Reveal>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
                    {`${user.name} hasn't published any Journey yet.`}
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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {journeys.map((journey, index) => (
                  <Reveal key={journey.id} delayMs={index * 80}>
                    <ContentCard
                      href={`/journeys/${journey.id}`}
                      imageUrl={journey.coverUrl}
                      imageAlt={journey.title}
                      title={journey.title}
                      category={journey.category}
                      status={
                        journey.status === "ARCHIVED"
                          ? "Archived"
                          : journey.status === "DISCOVERY"
                            ? "Discovery"
                            : journey.id === featuredJourney?.id
                              ? "In Progress"
                              : undefined
                      }
                      trust={Math.round(journey.journeyScore)}
                      menu={
                        isOwnProfile ? (
                          <JourneyCardMenu
                            journeyId={journey.id}
                            title={journey.title}
                            alreadyArchived={journey.status === "ARCHIVED"}
                            canMoveBack={index > 0}
                            canMoveForward={index < journeys.length - 1}
                          />
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
    </main>
  );
}
