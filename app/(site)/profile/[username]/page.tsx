import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { getViewerSession } from "@/lib/session";
import { getImagePlaybackUrl, getVideoPlaybackUrl } from "@/lib/r2";
import { FollowButton } from "@/components/profile/FollowButton";
import { ContentCard } from "@/components/profile/ContentCard";
import { ShareButton } from "@/components/common/ShareButton";
import { ReportButton } from "@/components/common/ReportButton";
import { HorizontalScrollRow } from "@/components/common/HorizontalScrollRow";
import { JourneyCardMenu } from "@/components/profile/JourneyCardMenu";
import { Reveal } from "@/components/common/Reveal";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileTabs, type ProfileTab } from "@/components/profile/ProfileTabs";
import { FeaturedJourneySection } from "@/components/profile/FeaturedJourneySection";
import { AboutCard } from "@/components/profile/AboutCard";
import { PresentationVideoCard } from "@/components/profile/PresentationVideoCard";
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
import { findUserByUsernameOrId } from "@/lib/profile/findUserByUsernameOrId";
import { FreeEventsSection, type FreeEventItem } from "@/components/profile/FreeEventsSection";

/** Quante Published Journeys mostrare in anteprima nell'Overview prima del link "View all"
 * verso la tab Journeys (che resta la lista completa, archiviati compresi). */
const PUBLISHED_JOURNEYS_PREVIEW_COUNT = 5;

/** Colori alternati per le scritte motivazionali del feed demo (DEMO_FEED_ITEMS), per non usare
 * solo l'ember su tutte e tre le card. */
const DEMO_MESSAGE_COLORS = ["text-ember", "text-ink", "text-ink-muted"];

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
  if (!user || user.deletedAt) notFound();

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

  const session = await getViewerSession();
  const isOwnProfile = session?.user.id === user.id;
  const isLoggedIn = Boolean(session);

  // Iniziative gratuite (Punto 8 dell'allineamento, 2026-09-25): sul profilo pubblico, non dentro
  // Subscribe — sono contenuto pubblico come i Journey, non un'offerta a pagamento.
  const freeEvents: FreeEventItem[] = creator
    ? await (async () => {
        const [freeWorkshops, freeEventRows] = await Promise.all([
          prisma.workshop.findMany({
            where: { creatorId: creator.id, deletedAt: null, status: "ACTIVE", isFree: true },
            orderBy: { startsAt: "asc" },
            include: {
              _count: { select: { rsvps: true } },
              rsvps: session ? { where: { userId: session.user.id }, select: { id: true } } : false,
            },
          }),
          prisma.event.findMany({
            where: { creatorId: creator.id, deletedAt: null, status: "ACTIVE", isFree: true },
            orderBy: { startsAt: "asc" },
            include: {
              _count: { select: { rsvps: true } },
              rsvps: session ? { where: { userId: session.user.id }, select: { id: true } } : false,
            },
          }),
        ]);

        return [
          ...freeWorkshops.map((item) => ({
            kind: "workshop" as const,
            id: item.id,
            title: item.title,
            description: item.description,
            startsAt: item.startsAt ? item.startsAt.toISOString() : null,
            going: Array.isArray(item.rsvps) && item.rsvps.length > 0,
            rsvpCount: item._count.rsvps,
          })),
          ...freeEventRows.map((item) => ({
            kind: "event" as const,
            id: item.id,
            title: item.title,
            description: item.description,
            startsAt: item.startsAt ? item.startsAt.toISOString() : null,
            going: Array.isArray(item.rsvps) && item.rsvps.length > 0,
            rsvpCount: item._count.rsvps,
          })),
        ];
      })()
    : [];

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

  const trustScore = creator ? computeTrustScore(await getCreatorTrustInputs(creator.id, followersCount)) : null;

  // Video di presentazione (attiva il Trust Score sopra, vedi lib/profile/trustScore.ts): un
  // visitatore che non ne ha mai caricato uno non vede la card, il proprietario la vede sempre
  // per poterlo aggiungere la prima volta.
  const presentationVideoUrl = creator?.presentationVideoUrl
    ? await getVideoPlaybackUrl(creator.presentationVideoUrl)
    : null;
  const showPresentationCard = isOwnProfile || presentationVideoUrl !== null;

  // Bio e video di presentazione condividono un'unica card (richiesto da Manuel, 2026-09-22):
  // AboutCard resta usata da sola solo quando il video non compare affatto (visitatore su un
  // profilo senza ancora un video di presentazione).
  const overviewCards: ReactNode[] = [];
  if (featuredJourney) overviewCards.push(<FeaturedJourneySection key="featured" journey={featuredJourney} />);
  if (showPresentationCard) {
    overviewCards.push(
      <PresentationVideoCard
        key="about-presentation"
        videoUrl={presentationVideoUrl}
        isOwnProfile={isOwnProfile}
        name={user.name}
        bio={user.bio}
        interests={user.interests}
      />
    );
  } else {
    overviewCards.push(<AboutCard key="about" name={user.name} bio={user.bio} interests={user.interests} />);
  }

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

      <ProfileHero
        profileUserId={user.id}
        coverUrl={coverUrl}
        avatarUrl={avatarUrl}
        name={user.name}
        username={user.username}
        location={user.location}
        joinedAt={user.createdAt}
        trustScore={trustScore}
        journeysCount={journeys.length}
        viewerId={session?.user.id ?? null}
        isLoggedIn={isLoggedIn}
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
                className="rounded-full border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] px-5 py-2.5 text-sm font-semibold text-ink backdrop-blur-md transition-colors hover:from-ember/15"
              >
                Dashboard
              </Link>
              <ShareProfileButton />
            </>
          ) : (
            <>
              <FollowButton userId={user.id} initialIsFollowing={isFollowing} isLoggedIn={isLoggedIn} />
              {canMessageUser && <MessageButton userId={user.id} />}
              {isLoggedIn && <ReportButton targetType="USER" targetId={user.id} />}
            </>
          )
        }
      />

      <ProfileTabs
        basePath={`/profile/${username}`}
        activeTab={activeTab}
        actions={!isOwnProfile && creator ? <CreatorEconomyLinks username={username} /> : undefined}
      />

      <div className="mx-auto max-w-[1400px] px-5 py-4 md:px-[calc(4.43%+2rem)]">
        {activeTab === "overview" && (
          <>
            {/* 1. Journey in corso + card Bio/Presentazione (unica, vedi sopra) */}
            <Reveal>
              {overviewCards.length === 1 ? (
                <div className="max-w-md">{overviewCards}</div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-[minmax(0,34%)_minmax(0,50%)] lg:justify-between">
                  {overviewCards}
                </div>
              )}
            </Reveal>

            {freeEvents.length > 0 && (
              <Reveal delayMs={20} className="mt-6 block">
                <FreeEventsSection items={freeEvents} isLoggedIn={isLoggedIn} />
              </Reveal>
            )}

            {/* 2. Recent Episodes: riga a scorrimento laterale stile Netflix, non una griglia —
                 circa 4 card visibili alla volta sui monitor desktop, il resto si scopre
                 scorrendo (stesso componente HorizontalScrollRow di Journeys/Journeyers). */}
            <Reveal delayMs={40} className="mt-6 block">
              {episodeFeedItems.length > 0 ? (
                <HorizontalScrollRow title="Recent Episodes">
                  {episodeFeedItems.map((item, index) => (
                    <ContentCard
                      key={item.episodeId}
                      className="w-56 shrink-0 sm:w-72 lg:w-80"
                      href={`/journeys/${item.journeyId}/episodes/${item.episodeId}`}
                      imageUrl={item.coverUrl}
                      imageAlt={item.title}
                      title={item.title}
                      category={item.category}
                      trust={item.journeyScore !== undefined ? Math.round(item.journeyScore) : undefined}
                      isVideo
                      emptyMessage={
                        isDemoFeed ? (
                          <span
                            className={`text-sm font-semibold leading-snug ${DEMO_MESSAGE_COLORS[index % DEMO_MESSAGE_COLORS.length]}`}
                          >
                            {item.caption}
                          </span>
                        ) : undefined
                      }
                      menu={
                        !isDemoFeed ? (
                          <ShareButton
                            path={`/journeys/${item.journeyId}/episodes/${item.episodeId}`}
                            label={item.title}
                            updateCaption={
                              isOwnProfile
                                ? `New episode: ${item.title}`
                                : `Check out this episode by ${user.name}: ${item.title}`
                            }
                            linkedEpisodeId={item.episodeId}
                          />
                        ) : undefined
                      }
                    />
                  ))}
                </HorizontalScrollRow>
              ) : (
                <section>
                  <h2 className="text-base font-bold tracking-tight">Recent Episodes</h2>
                  <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-muted">
                    {`${user.name} hasn't shared any episode yet.`}
                  </p>
                </section>
              )}
            </Reveal>

            {/* 3. Published Journeys (anteprima, "View all" -> tab Journeys) */}
            <Reveal delayMs={120} className="mt-6 block">
              <section>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-bold tracking-tight">Published Journeys</h2>
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
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-muted">
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
              <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-muted">
                {`${user.name} hasn't published any Journey yet.`}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

/** Bozza visiva (Punto 7 dell'allineamento, "Struttura pagine Creator Economy"): un solo punto di
 * ingresso verso la pagina Subscribe, che raccoglie al suo interno anche Shop, Workshop & Events
 * e 1:1 Consulting (deciso con Manuel il 2026-09-22: niente pagamento reale dietro per ora). */
function CreatorEconomyLinks({ username }: { username: string }) {
  const linkClassName =
    "shrink-0 rounded-full border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] px-4 py-2 text-sm text-white opacity-70 backdrop-blur-md transition-colors hover:opacity-100";
  return (
    <Link href={`/profile/${username}/membership`} className={linkClassName}>
      Subscribe
    </Link>
  );
}
