import Image from "next/image";
import Link from "next/link";
import { Compass, Flame, Video as VideoIcon, Star, ArrowRight, PlayCircle, Rss, Sparkles, UserPlus, Clock } from "lucide-react";
import { JourneyCard, type JourneyCardData } from "@/components/journey/JourneyCard";
import { MomentJourneyCard } from "@/components/journey/MomentJourneyCard";
import { VideoCard } from "@/components/journey/VideoCard";
import { FeedItem } from "@/components/journey/FeedItem";
import { CreatorResultCard } from "@/components/creator/CreatorResultCard";
import { Logo } from "@/components/layout/Logo";
import { Header } from "@/components/layout/Header";
import { OnboardingBanner } from "@/components/layout/OnboardingBanner";
import { Hero } from "@/components/landing/Hero";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ButtonPrimary, ButtonSecondary } from "@/components/common/Button";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DEMO_JOURNEYS } from "@/lib/demo/demoJourneys";
import {
  DEMO_UPDATES,
  DEMO_STORIES,
  DEMO_FEED,
  DEMO_CREATORS,
  DEMO_LATEST_VIDEOS,
  DEMO_TOP_JOURNEYS,
  DEMO_DISCOVERING_NOW,
} from "@/lib/demo/demoContent";
import { getRecommendedJourneys } from "@/lib/discovery/recommendedJourneys";
import { getRecommendedCreators } from "@/lib/discovery/recommendedCreators";
import { getFollowedCreatorsFeed, type FeedItem as FeedItemData } from "@/lib/discovery/feed";
import { getFollowedCreatorsUpdates } from "@/lib/discovery/updates";
import { getFollowedCreatorsStories } from "@/lib/discovery/stories";
import { getLatestVideos } from "@/lib/discovery/latestVideos";
import { getTopJourneys } from "@/lib/discovery/topJourneys";
import { getDiscoveringNowJourneys, type DiscoveringNowItem } from "@/lib/discovery/discoveringNow";
import { StoriesRow } from "@/components/home/StoriesRow";
import { getJourneyCountsByCategory } from "@/lib/discovery/categories";
import { JOURNEY_CATEGORIES, categoryToSlug } from "@/lib/constants/categories";
import { LIVE_JOURNEY_STATUSES, promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";

export default async function Home() {
  await promoteExpiredDiscoveryJourneys();
  const session = await getCurrentSession();
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

  const continueJourneys = await getContinueJourneys(session);
  const excludeFromDiscovery = continueJourneys.map((item) => item.journeyId);

  const [
    followedFeed,
    followedUpdates,
    creatorStories,
    recommendedJourneys,
    recommendedCreators,
    categoryCounts,
    momentJourneys,
    latestVideos,
    topJourneys,
    discoveringNow,
  ] = await Promise.all([
    getFollowedCreatorsFeed({ userId, excludeJourneyIds: excludeFromDiscovery }),
    getFollowedCreatorsUpdates({ userId, interests: userInterests }),
    getFollowedCreatorsStories({ userId }),
    getRecommendedJourneys({ userId, excludeJourneyIds: excludeFromDiscovery, interests: userInterests }),
    getRecommendedCreators({ userId, interests: userInterests }),
    getJourneyCountsByCategory(),
    getRecommendedJourneys({ userId, excludeJourneyIds: excludeFromDiscovery, limit: 10, interests: userInterests }),
    getLatestVideos({ limit: 10, interests: userInterests }),
    getTopJourneys({ limit: 10, interests: userInterests }),
    // Nessuna personalizzazione: "Discovering Now" mostra tutti i Journey in Discovery Phase a
    // chiunque, loggato o no, indipendentemente da interessi o creator seguiti (08_Algorithm.md).
    getDiscoveringNowJourneys(10),
  ]);

  const feedJourneyIds = followedFeed
    .filter((item) => item.type === "journey")
    .map((item) => item.journeyId);
  const newJourneys = await getNewJourneys([...excludeFromDiscovery, ...feedJourneyIds], userInterests);

  // DEMO DATA - replace when real data available: placeholder realistici per le sezioni
  // ancora vuote (nessun dato reale sufficiente), per una demo visiva completa. Ogni sezione
  // torna automaticamente ai dati reali non appena ce ne sono abbastanza, nessuna struttura da toccare.
  const displayedMomentJourneys = momentJourneys.length > 0 ? momentJourneys : DEMO_JOURNEYS;
  const displayedLatestVideos = latestVideos.length > 0 ? latestVideos : DEMO_LATEST_VIDEOS;
  const displayedTopJourneys = topJourneys.length > 0 ? topJourneys : DEMO_TOP_JOURNEYS;
  const displayedDiscoveringNow = discoveringNow.length > 0 ? discoveringNow : DEMO_DISCOVERING_NOW;
  const displayedFeed = followedFeed.length > 0 ? followedFeed : DEMO_FEED;
  const displayedUpdates = followedUpdates.length > 0 ? followedUpdates : DEMO_UPDATES;
  const displayedStories = creatorStories.length > 0 ? creatorStories : DEMO_STORIES;
  const displayedRecommendedJourneys = recommendedJourneys.length > 0 ? recommendedJourneys : DEMO_JOURNEYS.slice(0, 5);
  const displayedRecommendedCreators = recommendedCreators.length > 0 ? recommendedCreators : DEMO_CREATORS;

  return (
    <main>
      <Header />
      {userId && needsOnboarding && <OnboardingBanner userId={userId} />}
      <Hero updates={displayedUpdates} />

      <div id="discover">
        <DiscoveringNow journeys={displayedDiscoveringNow} />
        <JourneysOfTheMoment journeys={displayedMomentJourneys} />
        <LatestVideos videos={displayedLatestVideos} />
        <TopJourneys journeys={displayedTopJourneys} />
      </div>

      {continueJourneys.length > 0 && <ContinueJourney items={continueJourneys} />}
      <FollowedCreatorsFeed items={displayedFeed} />
      <StoriesRow stories={displayedStories} />
      <RecommendedJourneys journeys={displayedRecommendedJourneys} />
      <RecommendedCreators creators={displayedRecommendedCreators} />
      <NewJourneys journeys={newJourneys} />
      <Categories countByCategory={categoryCounts} />
      <HowItWorks />
      <Faq />
      <FinalCta />
      <SiteFooter />
    </main>
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

      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
                <p className="px-4 pb-4 text-xs text-ink-muted">
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
/* JOURNEYS OF THE MOMENT                                               */
/* ------------------------------------------------------------------ */

function JourneysOfTheMoment({ journeys }: { journeys: JourneyCardData[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <SectionHeading
          icon={<Flame className="h-6 w-6" aria-hidden="true" />}
          title="Journeys of the Moment"
          subtitle="The most followed and impactful journeys right now."
          viewAllHref="/discover/moment"
        />
      </Reveal>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {journeys.map((journey, index) => (
          <Reveal key={journey.id} as="li" delayMs={index * 70}>
            <MomentJourneyCard journey={journey} rank={index + 1} />
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

      <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                creator: { displayName: journey.creatorName },
              }}
              footer={
                <p className="px-4 pb-4 text-xs text-ink-muted">
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
/* CONTINUE YOUR JOURNEY                                                */
/* ------------------------------------------------------------------ */

type ContinueJourneyItem = {
  journeyId: string;
  title: string;
  coverUrl: string | null;
  creatorName: string;
  episodeId: string | null;
  episodeTitle: string | null;
};

async function getContinueJourneys(
  session: Awaited<ReturnType<typeof getCurrentSession>>
): Promise<ContinueJourneyItem[]> {
  if (!session) return [];

  const progresses = await prisma.journeyProgress.findMany({
    where: {
      userId: session.user.id,
      journey: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null },
    },
    orderBy: { updatedAt: "desc" },
    include: { journey: { include: { creator: true } } },
  });

  const episodeIds = progresses
    .map((progress) => progress.currentEpisodeId)
    .filter((id): id is string => id !== null);

  const episodes = await prisma.episode.findMany({
    where: { id: { in: episodeIds }, deletedAt: null },
  });
  const episodeById = new Map(episodes.map((episode) => [episode.id, episode]));

  return progresses.map((progress) => {
    const episode = progress.currentEpisodeId ? episodeById.get(progress.currentEpisodeId) : undefined;
    return {
      journeyId: progress.journeyId,
      title: progress.journey.title,
      coverUrl: progress.journey.coverUrl,
      creatorName: progress.journey.creator.displayName,
      episodeId: episode?.id ?? null,
      episodeTitle: episode?.title ?? null,
    };
  });
}

function ContinueJourney({ items }: { items: ContinueJourneyItem[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <SectionHeading
          icon={<PlayCircle className="h-6 w-6" aria-hidden="true" />}
          title="Continue Your Journey"
          subtitle="Pick up right where you left off."
        />
      </Reveal>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <Reveal key={item.journeyId} delayMs={index * 70}>
            <Link
              href={
                item.episodeId
                  ? `/journeys/${item.journeyId}/episodes#${item.episodeId}`
                  : `/journeys/${item.journeyId}`
              }
              className="group flex overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-ink-muted"
            >
              <div className="relative aspect-square w-24 flex-shrink-0 overflow-hidden bg-surface-2">
                {item.coverUrl ? (
                  <Image src={item.coverUrl} alt={item.title} fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-center px-4 py-3">
                <h3 className="text-sm font-bold leading-snug text-ink">{item.title}</h3>
                <p className="mt-1 text-xs text-ink-muted">by {item.creatorName}</p>
                {item.episodeTitle && (
                  <p className="mt-2 text-xs font-semibold text-ink-muted">
                    Continue: {item.episodeTitle}
                  </p>
                )}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FEED DEI CREATOR SEGUITI                                             */
/* ------------------------------------------------------------------ */

function FollowedCreatorsFeed({ items }: { items: FeedItemData[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <SectionHeading
          icon={<Rss className="h-6 w-6" aria-hidden="true" />}
          title="From creators you follow"
          subtitle="New Journeys and episodes from people you follow."
        />
      </Reveal>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map((item, index) => (
          <Reveal
            key={item.type === "journey" ? item.journeyId : item.episodeId}
            delayMs={index * 60}
          >
            <FeedItem item={item} />
          </Reveal>
        ))}
      </div>
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

      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
/* CREATOR CONSIGLIATI                                                 */
/* ------------------------------------------------------------------ */

function RecommendedCreators({ creators }: { creators: CreatorSearchResult[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <SectionHeading
          icon={<UserPlus className="h-6 w-6" aria-hidden="true" />}
          title="Creators to follow"
          subtitle="People documenting journeys like the ones you follow."
          viewAllHref="/discover/creators"
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
/* NEW JOURNEYS                                                        */
/* ------------------------------------------------------------------ */

async function getNewJourneys(
  excludeJourneyIds: string[] = [],
  interests: string[] = []
): Promise<JourneyCardData[]> {
  // Se l'utente ha interessi dichiarati, si guarda un gruppo più ampio di Journey recenti
  // per poter dare priorità a quelli nelle sue categorie, mantenendo comunque l'ordine
  // dal più recente al meno recente sia tra i match sia tra il resto (vedi sotto).
  const pool = interests.length > 0 ? 20 : 5;

  const journeys = await prisma.journey.findMany({
    where: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null, id: { notIn: excludeJourneyIds } },
    orderBy: { publishedAt: "desc" },
    take: pool,
    include: { creator: { include: { user: { include: { _count: { select: { followers: true } } } } } } },
  });

  if (journeys.length === 0) {
    // Nessun risultato può voler dire "nessun Journey pubblicato" (mostra la demo) oppure
    // "tutti i Journey pubblicati sono già esclusi" (es. tutti nel Feed): solo nel primo caso
    // ha senso il fallback demo, altrimenti la sezione resta vuota di proposito.
    const anyPublished = await prisma.journey.count({
      where: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null },
    });
    return anyPublished === 0 ? DEMO_JOURNEYS : [];
  }

  const ordered = interests.length === 0
    ? journeys
    : (() => {
        const interestSet = new Set(interests);
        const matching = journeys.filter((journey) => journey.category && interestSet.has(journey.category));
        const rest = journeys.filter((journey) => !(journey.category && interestSet.has(journey.category)));
        return [...matching, ...rest];
      })();

  return ordered.slice(0, 5).map((journey) => ({
    id: journey.id,
    title: journey.title,
    coverUrl: journey.coverUrl,
    category: journey.category,
    creator: { displayName: journey.creator.displayName },
    followersCount: journey.creator.user._count.followers,
  }));
}

function NewJourneys({ journeys }: { journeys: JourneyCardData[] }) {
  return (
    <section id="journey" className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <SectionHeading
          icon={<Clock className="h-6 w-6" aria-hidden="true" />}
          title="New Journeys"
          subtitle="Real stories. Real impact."
          viewAllHref="/discover/new"
        />
      </Reveal>

      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
          viewAllHref="/categories"
        />
      </Reveal>

      <Reveal delayMs={60}>
        <div className="mt-4 flex flex-wrap gap-3">
          {JOURNEY_CATEGORIES.map((category) => {
            const count = countByCategory.get(category) ?? 0;
            return (
              <Link
                key={category}
                href={`/categories/${categoryToSlug(category)}`}
                className="rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-muted"
              >
                {category}
                <span className="ml-2 text-ink-faint">{count}</span>
              </Link>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* HOW IT WORKS                                                        */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Choose a Journey",
      text:
        "Browse real transformations from other people and choose the one that inspires you most.",
    },
    {
      number: "02",
      title: "Follow it chapter by chapter",
      text:
        "Pick up exactly where you left off, just like a streaming platform.",
    },
    {
      number: "03",
      title: "Build your own",
      text:
        "Become a creator and document your transformation, mistakes included.",
    },
  ];

  return (
    <section id="how-it-works" className="mx-auto max-w-[1400px] px-5 py-10 md:px-8">
      <Reveal>
        <h2 className="mb-14 text-2xl font-bold tracking-tight sm:text-3xl">
          How it works
        </h2>
      </Reveal>
      <div className="grid gap-10 md:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal key={step.number} delayMs={index * 120}>
            <span className="text-sm font-bold text-ink-faint">
              {step.number}
            </span>
            <h3 className="mt-3 text-lg font-bold">{step.title}</h3>
            <p className="mt-2 text-ink-muted">{step.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                  */
/* ------------------------------------------------------------------ */

function Faq() {
  const questions = [
    {
      q: "What is a Journey?",
      a: "It's the complete path of a real transformation, told in chapters and episodes: not just the final outcome, but the whole process.",
    },
    {
      q: "Is Zero free?",
      a: "Yes, following Journeys and using Zero as a viewer is free. Some creators offer paid communities, workshops, or services.",
    },
    {
      q: "Can I become a creator?",
      a: "Yes. Create a creator profile and publish your first Journey — in the first version you can have one active Journey at a time.",
    },
    {
      q: "Is my data safe?",
      a: "Yes, payments go through Stripe only and your data is never shared with third parties without your consent.",
    },
  ];

  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-10 md:px-8">
      <Reveal>
        <h2 className="mb-10 text-2xl font-bold tracking-tight sm:text-3xl">
          Frequently asked questions
        </h2>
      </Reveal>
      <div className="divide-y divide-border">
        {questions.map((item, index) => (
          <Reveal key={item.q} delayMs={index * 60}>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">
                {item.q}
                <span className="ml-4 text-ink-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-ink-muted">{item.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
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
                Ready to start your journey?
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-muted">
                Join thousands of creators and start documenting your transformation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonPrimary href="/register">
                Start Your Journey
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonPrimary>
              <ButtonSecondary href="/categories">Explore Journeys</ButtonSecondary>
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
