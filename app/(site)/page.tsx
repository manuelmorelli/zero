import Image from "next/image";
import Link from "next/link";
import { Compass, Video as VideoIcon, Star, ArrowRight, Sparkles, Shuffle, HelpCircle, History, Play, ShieldCheck } from "lucide-react";
import type { ContinueJourneyItem } from "@/lib/discovery/continueJourneys";
import { JourneyCard, type JourneyCardData } from "@/components/journey/JourneyCard";
import { VideoCard } from "@/components/journey/VideoCard";
import { Avatar } from "@/components/common/Avatar";
import { CreatorResultCard } from "@/components/creator/CreatorResultCard";
import { Logo } from "@/components/layout/Logo";
import { OnboardingBanner } from "@/components/layout/OnboardingBanner";
import { Hero } from "@/components/landing/Hero";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ButtonPrimary, ButtonSecondary } from "@/components/common/Button";
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
import { demoHeroSlidesWithKind, type HeroSlide } from "@/lib/demo/heroSlides";
import { getDiscoveringNowJourneys, type DiscoveringNowItem } from "@/lib/discovery/discoveringNow";
import { getContinueJourneys } from "@/lib/discovery/continueJourneys";
import { getJourneyCountsByCategory } from "@/lib/discovery/categories";
import { JOURNEY_CATEGORIES, categoryToSlug } from "@/lib/constants/categories";
import { promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";

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
  ] = await Promise.all([
    getFollowedCreatorsStories({ userId }),
    getOwnStory({ userId }),
    getRecommendedJourneys({ userId, excludeJourneyIds: excludeFromDiscovery, limit: 4, interests: userInterests }),
    getWildcardsToFollow(5),
    getJourneyCountsByCategory(),
    getLatestVideos({ limit: 4, interests: userInterests }),
    getTopJourneys({ limit: 4, interests: userInterests }),
    // Nessuna personalizzazione: "Discovering Now" mostra tutti i Journey in Discovery Phase a
    // chiunque, loggato o no, indipendentemente da interessi o creator seguiti (08_Algorithm.md).
    getDiscoveringNowJourneys(4),
    getHeroJourneys(4),
  ]);

  // DEMO DATA - replace when real data available: placeholder realistici per le sezioni
  // ancora vuote (nessun dato reale sufficiente), per una demo visiva completa. Ogni sezione
  // torna automaticamente ai dati reali non appena ce ne sono abbastanza, nessuna struttura da toccare.
  const displayedLatestVideos = (latestVideos.length > 0 ? latestVideos : DEMO_LATEST_VIDEOS).slice(0, 4);
  const displayedTopJourneys = (topJourneys.length > 0 ? topJourneys : DEMO_TOP_JOURNEYS).slice(0, 4);
  const displayedDiscoveringNow = (discoveringNow.length > 0 ? discoveringNow : DEMO_DISCOVERING_NOW).slice(0, 4);
  const displayedStories = creatorStories.length > 0 ? creatorStories : DEMO_STORIES;
  const displayedRecommendedJourneys = (recommendedJourneys.length > 0 ? recommendedJourneys : DEMO_JOURNEYS).slice(0, 4);
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
      <Hero slides={heroSlides} stories={userId ? displayedStories : []} ownStory={userId ? ownStory : null} />

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
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <SectionHeading
          icon={<History className="h-6 w-6" aria-hidden="true" />}
          title="Continue Watching"
          subtitle="Pick up where you left off."
        />
      </Reveal>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {journeys.map((item, index) => (
          <Reveal key={item.journeyId} as="li" delayMs={index * 70}>
            <Link
              href={item.episodeId ? `/journeys/${item.journeyId}/episodes/${item.episodeId}` : `/journeys/${item.journeyId}`}
              className="group block transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-border transition-[border-color,box-shadow] duration-300 group-hover:border-ember/40 group-hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]">
                {item.coverUrl ? (
                  <Image
                    src={item.coverUrl}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-transparent" />
                <span className="absolute left-2.5 top-2.5 rounded-full border border-ember/30 bg-bg/70 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-ember backdrop-blur-md">
                  Continue watching
                </span>
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-bg/50 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-4 w-4 translate-x-[1px] fill-current text-ember" aria-hidden="true" />
                  </span>
                </span>

                <div className="absolute inset-x-0 bottom-0 p-3">
                  {item.category && (
                    <span className="inline-block rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                      {item.category}
                    </span>
                  )}
                  <h3 className="mt-2 truncate text-base font-bold leading-tight text-white transition-colors group-hover:text-ember">
                    {item.episodeTitle ?? item.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-xs text-white/85">
                      <Avatar name={item.creatorName} className="h-5 w-5 text-[0.55rem]" />
                      <span className="truncate">{item.creatorName}</span>
                    </span>
                    {item.journeyScore !== undefined && (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-ember">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.journeyScore}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
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
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <SectionHeading
          icon={<Compass className="h-6 w-6" aria-hidden="true" />}
          title="Discovering Now"
          subtitle="Brand new Journeys, shown to everyone — not just people who already follow this topic."
          viewAllHref="/discover/now"
        />
      </Reveal>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {journeys.map((journey, index) => (
          <Reveal key={journey.id} as="li" delayMs={index * 70}>
            <JourneyCard
              journey={{
                id: journey.id,
                title: journey.title,
                coverUrl: journey.coverUrl,
                category: journey.category,
                creator: { displayName: journey.creatorName },
              }}
              footer={
                <p className="mt-2 text-xs text-ink-muted">
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
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <SectionHeading
          icon={<VideoIcon className="h-6 w-6" aria-hidden="true" />}
          title="Latest Videos"
          subtitle="New episodes just published across Zero."
          viewAllHref="/discover/latest-videos"
        />
      </Reveal>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <SectionHeading
          icon={<Star className="h-6 w-6 fill-current" aria-hidden="true" />}
          title="Top Journeys"
          subtitle="Timeless stories that continue to inspire."
          viewAllHref="/discover/top"
        />
      </Reveal>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {journeys.map((journey, index) => (
          <Reveal key={journey.id} as="li" delayMs={index * 70}>
            <JourneyCard
              journey={{
                id: journey.id,
                title: journey.title,
                coverUrl: journey.coverUrl,
                category: journey.category,
                journeyScore: journey.journeyScore,
                creator: { displayName: journey.creatorName },
              }}
              footer={
                <p className="mt-2 text-xs text-ink-muted">
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
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <SectionHeading
          icon={<Sparkles className="h-6 w-6" aria-hidden="true" />}
          title="Recommended for you"
          subtitle="Picked based on who you follow."
          viewAllHref="/discover/recommended"
        />
      </Reveal>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
/* ogni categoria (lib/discovery/wildcardCreators.ts), sostituisce la   */
/* vecchia riga "Creators to follow" (raccomandazione personalizzata,    */
/* ora coperta da "Recommended for you")                                */
/* ------------------------------------------------------------------ */

function WildcardsToFollow({ creators }: { creators: CreatorSearchResult[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <SectionHeading
          icon={<Shuffle className="h-6 w-6" aria-hidden="true" />}
          title="Wildcards to follow"
          subtitle="A random pick from each category, refreshed daily."
        />
      </Reveal>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {creators.map((creator, index) => (
          <Reveal key={creator.id} as="li" delayMs={index * 70}>
            <CreatorResultCard creator={creator} />
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
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
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
              <Link
                key={category}
                href={`/journeys#${categoryToSlug(category)}`}
                className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink-muted"
              >
                {category}
                <span className="ml-1.5 text-ink-faint">{count}</span>
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
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <Link
          href="/how-it-works"
          className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-ink-muted"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface-2">
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-ink">How Zero works</h2>
              <p className="truncate text-xs text-ink-muted">
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
    <section className="mx-auto max-w-[1400px] px-5 py-4 pb-10 md:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <Image
            src="/images/hero-2.jpg"
            alt=""
            fill
            sizes="(min-width: 1400px) 1400px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/60" />
          <div className="relative grid items-center gap-6 p-7 md:grid-cols-[minmax(0,1fr)_auto] md:p-10">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Every Journey Starts From <span className="text-ember">Zero</span>.
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-muted">
                Start documenting your story today — one honest episode at a time.
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
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-ink-muted sm:flex-row md:px-8">
        <Logo className="h-6" />
        <p>© {new Date().getFullYear()} Zero. Every journey starts from zero.</p>
      </div>
    </footer>
  );
}
