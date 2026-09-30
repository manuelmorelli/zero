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
import { FreeEventsSection } from "@/components/profile/FreeEventsSection";
import { getFreeEventItems } from "@/lib/community/freeEvents";
import { NOTICE } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/heading";
import { PAGE_WIDTH } from "@/components/ui/page-container";
import { CARD_ROW_ITEM } from "@/components/ui/cover-card";
import { cn } from "@/lib/utils";

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

  // Iniziative gratuite (Punto 8 dell'allineamento, 2026-09-25): anteprima sul profilo pubblico
  // (Manuel, 2026-09-26: "la card in home page personale non mi dispiace"), l'elenco completo vive
  // nella pagina Community (ex Subscribe) insieme alle offerte a pagamento.
  const freeEvents = creator ? await getFreeEventItems(creator.id, session?.user.id ?? null) : [];

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
              <Button variant="secondary" href="/dashboard">
                Dashboard
              </Button>
              <Button variant="secondary" href="/dashboard/community">
                Community
              </Button>
              <ShareProfileButton />
            </>
          ) : (
            <>
              <FollowButton userId={user.id} initialIsFollowing={isFollowing} isLoggedIn={isLoggedIn} />
              {canMessageUser && <MessageButton userId={user.id} />}
              {creator && <CreatorEconomyLinks username={username} />}
              {isLoggedIn && <ReportButton targetType="USER" targetId={user.id} />}
            </>
          )
        }
      />

      <ProfileTabs basePath={`/profile/${username}`} activeTab={activeTab} />

      <div className={cn(PAGE_WIDTH.wideCover, "py-4")}>
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

            {/* 2. Published Journeys (anteprima, "View all" -> tab Journeys) */}
            <Reveal delayMs={40} className="mt-6 block">
              <section>
                <div className="flex items-center justify-between gap-3">
                  <SectionTitle>Published Journeys</SectionTitle>
                  {liveJourneys.length > PUBLISHED_JOURNEYS_PREVIEW_COUNT && (
                    <Link
                      href={`/profile/${username}?tab=journeys`}
                      className="text-sm text-ink-muted transition-colors hover:text-ember"
                    >
                      View All →
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
                  <p className={`mt-4 ${NOTICE}`}>
                    {`${user.name} hasn't published any Journey yet.`}
                  </p>
                )}
              </section>
            </Reveal>

            {/* 3. Recent Episodes: riga a scorrimento laterale stile Netflix, non una griglia —
                 formato rettangolare "episode" (4:3), stesso usato dalle card video altrove nel
                 sito (es. VideoCard in Home) — circa 4 card visibili alla volta sui monitor
                 desktop, il resto si scopre scorrendo (stesso componente HorizontalScrollRow di
                 Journeys/Journeyers). */}
            <Reveal delayMs={120} className="mt-6 block">
              {episodeFeedItems.length > 0 ? (
                <HorizontalScrollRow title="Recent Episodes">
                  {episodeFeedItems.map((item, index) => (
                    <ContentCard
                      key={item.episodeId}
                      format="episode"
                      className={CARD_ROW_ITEM.episode}
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
                  <SectionTitle>Recent Episodes</SectionTitle>
                  <p className={`mt-4 ${NOTICE}`}>
                    {`${user.name} hasn't shared any episode yet.`}
                  </p>
                </section>
              )}
            </Reveal>
          </>
        )}

        {activeTab === "journeys" && (
          <section>
            {journeys.length === 0 ? (
              <p className={NOTICE}>
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
 * ingresso verso la pagina Community (ex Subscribe, rinominata il 2026-09-26 su richiesta di
 * Manuel), che raccoglie al suo interno anche eventi gratuiti, Shop, Workshop & Events e 1:1
 * Consulting (deciso con Manuel il 2026-09-22: niente pagamento reale dietro per ora). */
function CreatorEconomyLinks({ username }: { username: string }) {
  return (
    <Button variant="secondary" href={`/profile/${username}/community`}>
      Community
    </Button>
  );
}
