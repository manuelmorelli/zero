import Image from "next/image";
import Link from "next/link";
import { Compass, Video as VideoIcon, Star, ArrowRight, Sparkles, Shuffle, HelpCircle, History, Play, ShieldCheck } from "lucide-react";
import type { ContinueJourneyItem } from "@/lib/discovery/continueJourneys";
import { JourneyCard, type JourneyCardData } from "@/components/journey/JourneyCard";
import { VideoCard } from "@/components/journey/VideoCard";
import { Avatar } from "@/components/ui/avatar";
import { JourneyerCard } from "@/components/profile/JourneyerCard";
import { Logo } from "@/components/layout/Logo";
import { OnboardingBanner } from "@/components/layout/OnboardingBanner";
import { Hero } from "@/components/landing/Hero";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/button";
import { CARD_GRID, CoverChip, CoverFrame, CoverPlay, CoverTitle } from "@/components/ui/cover-card";
import { CardTitle, PageTitle } from "@/components/ui/heading";
import { CHIP, PANEL } from "@/components/ui/panel";
import { PAGE_WIDTH } from "@/components/ui/page-container";
import { getViewerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DEMO_JOURNEYS } from "@/lib/demo/demoJourneys";
import {
  DEMO_STORIES,
  DEMO_CREATORS,
  DEMO_LATEST_VIDEOS,
  DEMO_TOP_JOURNEYS,
  DEMO_DISCOVERING_NOW,
} from "@/lib/demo/demoContent";
import { getRecommendedJourneys } from "@/lib/discovery/recommendedJourneys";
import { getWildcardsToFollow } from "@/lib/discovery/wildcardCreators";
import { getFollowedCreatorsStories, getOwnStory } from "@/lib/discovery/stories";
import { getLatestVideos } from "@/lib/discovery/latestVideos";
import { getTopJourneys } from "@/lib/discovery/topJourneys";
import { getHeroJourneys } from "@/lib/discovery/heroJourneys";
import { getHeroVideos } from "@/lib/discovery/heroVideos";
import { demoHeroSlidesWithKind, type HeroSlide } from "@/lib/demo/heroSlides";
import { getDiscoveringNowJourneys, type DiscoveringNowItem } from "@/lib/discovery/discoveringNow";
import { getContinueJourneys } from "@/lib/discovery/continueJourneys";
import { getJourneyCountsByCategory } from "@/lib/discovery/categories";
import { JOURNEY_CATEGORIES, categoryToSlug } from "@/lib/constants/categories";
import { promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";

/** Una riga piena per formato di card (CARD_GRID): 5 Journey, 4 episodi, 8 persone. */
const JOURNEYS_PER_ROW = 5;
const PEOPLE_PER_ROW = 8;
const HOME_SECTION = `${PAGE_WIDTH.wide} py-4`;

export default async function Home() {
  await promoteExpiredDiscoveryJourneys();
  const session = await getViewerSession();
  const userId = session?.user.id ?? null;

  // L'Onboarding (selezione interessi) non blocca più l'accesso alla Home (vedi
  // 00-project-context.md, sezione "Onboarding"): resta un invito non invasivo,
  // mostrato come banner dismissibile invece di un redirect forzato.
  let needsOnboarding = false;
  let userInterests: string[] = [];
  if (userId) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { interests: true },
    });
    userInterests = currentUser?.interests ?? [];
    needsOnboarding = userInterests.length === 0;
  }

  // "Continue Watching": riga in cima alla Home (sotto l'Hero) per chi ha già un avanzamento
  // salvato su almeno un Journey. Serve anche a escludere dalle righe di scoperta i Journey che
  // l'utente sta già seguendo passo passo, per non proporglieli due volte.
  const continueJourneys = await getContinueJourneys(session);
  const excludeFromDiscovery = continueJourneys.map((item) => item.journeyId);

  const [
    creatorStories,
    ownStory,
    recommendedJourneys,
    wildcardsToFollow,
    categoryCounts,
    latestVideos,
    topJourneys,
    discoveringNow,
    heroJourneys,
    heroVideos,
  ] = await Promise.all([
    getFollowedCreatorsStories({ userId }),
    getOwnStory({ userId }),
    getRecommendedJourneys({ userId, excludeJourneyIds: excludeFromDiscovery, limit: JOURNEYS_PER_ROW, interests: userInterests }),
    getWildcardsToFollow(PEOPLE_PER_ROW),
    getJourneyCountsByCategory(),
    getLatestVideos({ limit: 4, interests: userInterests }),
    getTopJourneys({ limit: JOURNEYS_PER_ROW, interests: userInterests }),
    // Nessuna personalizzazione: "Discovering Now" mostra tutti i Journey in Discovery Phase a
    // chiunque, loggato o no, indipendentemente da interessi o creator seguiti (08_Algorithm.md).
    getDiscoveringNowJourneys(JOURNEYS_PER_ROW),
    getHeroJourneys(4),
    getHeroVideos(),
  ]);

  // DEMO DATA - replace when real data available: placeholder realistici per le sezioni
  // ancora vuote (nessun dato reale sufficiente), per una demo visiva completa. Ogni sezione
  // torna automaticamente ai dati reali non appena ce ne sono abbastanza, nessuna struttura da toccare.
  const displayedLatestVideos = (latestVideos.length > 0 ? latestVideos : DEMO_LATEST_VIDEOS).slice(0, 4);
  const displayedTopJourneys = (topJourneys.length > 0 ? topJourneys : DEMO_TOP_JOURNEYS).slice(0, JOURNEYS_PER_ROW);
  const displayedDiscoveringNow = (discoveringNow.length > 0 ? discoveringNow : DEMO_DISCOVERING_NOW).slice(0, JOURNEYS_PER_ROW);
  const displayedStories = creatorStories.length > 0 ? creatorStories : DEMO_STORIES;
  const displayedRecommendedJourneys = (recommendedJourneys.length > 0 ? recommendedJourneys : DEMO_JOURNEYS).slice(0, JOURNEYS_PER_ROW);
  const displayedWildcardsToFollow = wildcardsToFollow.length > 0 ? wildcardsToFollow : DEMO_CREATORS;
  const heroSlides: HeroSlide[] =
    heroJourneys.length > 0
      ? heroJourneys.map((journey) => ({
          kind: "journey" as const,
          id: journey.id,
          image: journey.coverUrl!,
          alt: journey.title,
          title: journey.title,
          category: journey.category,
          creatorName: journey.creatorName,
        }))
      : demoHeroSlidesWithKind;

  return (
    <main>
      {userId && needsOnboarding && <OnboardingBanner userId={userId} />}

      {/* Bagliore ambra dietro la Hero: rimosso (esperimento "design più vivo", round colori) —
       * sporcava lo sfondo di arancio insieme a quello sitewide in globals.css. */}
      <div className="relative md:pt-[calc(3.85rem+1cm)]">
        <Hero slides={heroSlides} videos={heroVideos} stories={userId ? displayedStories : []} ownStory={userId ? ownStory : null} />
      </div>

      {userId && continueJourneys.length > 0 && <ContinueWatching journeys={continueJourneys} />}

      <div id="discover">
        <RecommendedJourneys journeys={displayedRecommendedJourneys} />
        <DiscoveringNow journeys={displayedDiscoveringNow} />
        <TopJourneys journeys={displayedTopJourneys} />
        <LatestVideos videos={displayedLatestVideos} />
        <WildcardsToFollow creators={displayedWildcardsToFollow} />
      </div>

      <Categories countByCategory={categoryCounts} />
      <HowItWorksCta />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* CONTINUE WATCHING — riprendi da dove hai lasciato                   */
/* ------------------------------------------------------------------ */

function ContinueWatching({ journeys }: { journeys: ContinueJourneyItem[] }) {
  return (
    <section className={HOME_SECTION}>
      <Reveal>
        <SectionHeading
          icon={<History className="h-6 w-6" aria-hidden="true" />}
          title="Continue Watching"
          subtitle="Pick up where you left off."
        />
      </Reveal>

      <ul className={`mt-4 ${CARD_GRID.episode}`}>
        {journeys.map((item, index) => (
          <Reveal key={item.journeyId} as="li" delayMs={index * 70}>
            <CoverFrame
              format="episode"
              href={item.episodeId ? `/journeys/${item.journeyId}/episodes/${item.episodeId}` : `/journeys/${item.journeyId}`}
              imageUrl={item.coverUrl}
              imageAlt={item.title}
              topLeft={<CoverChip className="text-ember">Continue Watching</CoverChip>}
              center={
                <CoverPlay>
                  <Play className="h-4 w-4 translate-x-px fill-current" aria-hidden="true" />
                </CoverPlay>
              }
              overlay={
                <>
                  {item.category && <CoverChip>{item.category}</CoverChip>}
                  <CoverTitle className="mt-2">{item.episodeTitle ?? item.title}</CoverTitle>
                  <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Avatar name={item.creatorName} avatarUrl={item.creatorAvatarUrl} size="xs" />
                      <span className="truncate">{item.creatorName}</span>
                    </span>
                    {item.journeyScore !== undefined && (
                      <span className="flex shrink-0 items-center gap-1 font-bold text-ember">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        {item.journeyScore}
                      </span>
                    )}
                  </div>
                </>
              }
            />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* DISCOVERING NOW — Discovery Phase, 08_Algorithm.md                  */
/* ------------------------------------------------------------------ */

function DiscoveringNow({ journeys }: { journeys: DiscoveringNowItem[] }) {
  return (
    <section className={HOME_SECTION}>
      <Reveal>
        <SectionHeading
          icon={<Compass className="h-6 w-6" aria-hidden="true" />}
          title="Discovering Now"
          subtitle="Brand new Journeys, shown to everyone, not just people who already follow this topic."
          viewAllHref="/discover/now"
        />
      </Reveal>

      <ul className={`mt-4 ${CARD_GRID.journey}`}>
        {journeys.map((journey, index) => (
          <Reveal key={journey.id} as="li" delayMs={index * 70}>
            <JourneyCard
              journey={{
                id: journey.id,
                title: journey.title,
                coverUrl: journey.coverUrl,
                category: journey.category,
                creator: { displayName: journey.creatorName, avatarUrl: journey.creatorAvatarUrl },
              }}
              footer={
                <p className="mt-2 text-sm text-ink-muted">
                  {journey.daysLeft} {journey.daysLeft === 1 ? "day" : "days"} left in Discovery
                </p>
              }
            />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* LATEST VIDEOS                                                        */
/* ------------------------------------------------------------------ */

function LatestVideos({ videos }: { videos: Awaited<ReturnType<typeof getLatestVideos>> }) {
  return (
    <section className={HOME_SECTION}>
      <Reveal>
        <SectionHeading
          icon={<VideoIcon className="h-6 w-6" aria-hidden="true" />}
          title="Latest Videos"
          subtitle="New episodes just published across Zero."
          viewAllHref="/discover/latest-videos"
        />
      </Reveal>

      <ul className={`mt-4 ${CARD_GRID.episode}`}>
        {videos.map((video, index) => (
          <Reveal key={video.episodeId} as="li" delayMs={index * 70}>
            <VideoCard video={video} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* TOP JOURNEYS                                                         */
/* ------------------------------------------------------------------ */

function TopJourneys({ journeys }: { journeys: Awaited<ReturnType<typeof getTopJourneys>> }) {
  return (
    <section className={HOME_SECTION}>
      <Reveal>
        <SectionHeading
          icon={<Star className="h-6 w-6 fill-current" aria-hidden="true" />}
          title="Top Journeys"
          subtitle="Timeless stories that continue to inspire."
          viewAllHref="/discover/top"
        />
      </Reveal>

      <ul className={`mt-4 ${CARD_GRID.journey}`}>
        {journeys.map((journey, index) => (
          <Reveal key={journey.id} as="li" delayMs={index * 70}>
            <JourneyCard
              journey={{
                id: journey.id,
                title: journey.title,
                coverUrl: journey.coverUrl,
                category: journey.category,
                journeyScore: journey.journeyScore,
                creator: { displayName: journey.creatorName, avatarUrl: journey.creatorAvatarUrl },
              }}
              footer={
                <p className="mt-2 text-sm text-ink-muted">
                  {journey.episodesCount} {journey.episodesCount === 1 ? "episode" : "episodes"}
                </p>
              }
            />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* RECOMMENDED JOURNEYS                                                */
/* ------------------------------------------------------------------ */

function RecommendedJourneys({ journeys }: { journeys: JourneyCardData[] }) {
  return (
    <section className={HOME_SECTION}>
      <Reveal>
        <SectionHeading
          icon={<Sparkles className="h-6 w-6" aria-hidden="true" />}
          title="Recommended for You"
          subtitle="Picked based on who you follow."
          viewAllHref="/discover/recommended"
        />
      </Reveal>

      <ul className={`mt-4 ${CARD_GRID.journey}`}>
        {journeys.map((journey, index) => (
          <Reveal key={journey.id} as="li" delayMs={index * 70}>
            <JourneyCard journey={journey} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* WILDCARDS TO FOLLOW — creator dietro il pick Wildcard stabile di      */
/* ogni categoria (lib/discovery/wildcardCreators.ts)                   */
/* ------------------------------------------------------------------ */

function WildcardsToFollow({ creators }: { creators: CreatorSearchResult[] }) {
  return (
    <section className={HOME_SECTION}>
      <Reveal>
        <SectionHeading
          icon={<Shuffle className="h-6 w-6" aria-hidden="true" />}
          title="Wildcards to Follow"
          subtitle="A random pick from each category, refreshed daily."
        />
      </Reveal>

      <ul className={`mt-4 ${CARD_GRID.person}`}>
        {creators.map((creator, index) => (
          <Reveal key={creator.id} as="li" delayMs={index * 70}>
            <JourneyerCard journeyer={creator} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CATEGORIES                                                           */
/* ------------------------------------------------------------------ */

function Categories({ countByCategory }: { countByCategory: Map<string, number> }) {
  return (
    <section className={HOME_SECTION}>
      <Reveal>
        <SectionHeading
          icon={<Compass className="h-6 w-6" aria-hidden="true" />}
          title="Categories"
          subtitle="Not sure where to start? Browse by category."
          viewAllHref="/journeys"
        />
      </Reveal>

      <Reveal delayMs={60}>
        <div className="mt-4 flex flex-wrap gap-2">
          {JOURNEY_CATEGORIES.map((category) => {
            const count = countByCategory.get(category) ?? 0;
            return (
              <Link key={category} href={`/journeys#${categoryToSlug(category)}`} className={CHIP}>
                {category}
                <span className="text-ink-faint">{count}</span>
              </Link>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* HOW IT WORKS — card compatta, contenuto completo su /how-it-works   */
/* ------------------------------------------------------------------ */

function HowItWorksCta() {
  return (
    <section className={HOME_SECTION}>
      <Reveal>
        <Link
          href="/how-it-works"
          className={`group flex items-center justify-between gap-4 transition-colors hover:border-ink-muted ${PANEL}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface-2 text-ember">
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <CardTitle as="h2">How Zero Works</CardTitle>
              <p className="truncate text-sm text-ink-muted">
                Three steps to get started, plus answers to common questions.
              </p>
            </div>
          </div>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FINAL CTA                                                            */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className={`${HOME_SECTION} pb-10`}>
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <Image
            src="/images/hero-2.jpg"
            alt=""
            fill
            sizes="(min-width: 1400px) 1400px, 100vw"
            className="object-cover"
          />
          <div className="banner-scrim absolute inset-0" />
          <div className="relative grid items-center gap-6 p-7 md:grid-cols-[minmax(0,1fr)_auto] md:p-10">
            <div className="min-w-0">
              <PageTitle as="h2">
                Every journey starts from <span className="text-ember">Zero</span>.
              </PageTitle>
              <p className="mt-2 max-w-md text-sm text-ink-muted">
                Start documenting your story today, one honest episode at a time.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonPrimary href="/register">
                Start Your Journey
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonPrimary>
              <ButtonSecondary href="/journeys">Journeys</ButtonSecondary>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FOOTER                                                               */
/* ------------------------------------------------------------------ */

function SiteFooter() {
  return (
    <footer>
      <div className={`${PAGE_WIDTH.wide} flex flex-col items-center justify-between gap-4 py-10 text-sm text-ink-muted sm:flex-row`}>
        <Logo className="h-6" />
        <p>© {new Date().getFullYear()} Zero. Every journey starts from Zero.</p>
      </div>
    </footer>
  );
}
