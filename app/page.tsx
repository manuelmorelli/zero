import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JourneyCard, type JourneyCardData } from "@/components/journey/JourneyCard";
import { FeedItem } from "@/components/journey/FeedItem";
import { CreatorResultCard } from "@/components/creator/CreatorResultCard";
import { AuthStatus } from "@/components/layout/AuthStatus";
import { Logo } from "@/components/layout/Logo";
import { Hero } from "@/components/landing/Hero";
import { Reveal } from "@/components/common/Reveal";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DEMO_JOURNEYS } from "@/lib/demo/demoJourneys";
import { getRecommendedJourneys } from "@/lib/discovery/recommendedJourneys";
import { getRecommendedCreators } from "@/lib/discovery/recommendedCreators";
import { getFollowedCreatorsFeed, type FeedItem as FeedItemData } from "@/lib/discovery/feed";
import { getFollowedCreatorsUpdates, type FollowedUpdate } from "@/lib/discovery/updates";
import { UpdateCard } from "@/components/journey/UpdateCard";
import { getJourneyCountsByCategory } from "@/lib/discovery/categories";
import { JOURNEY_CATEGORIES, categoryToSlug } from "@/lib/constants/categories";
import { SearchForm, SearchIcon } from "@/components/search/SearchForm";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";

export default async function Home() {
  const session = await getCurrentSession();
  const userId = session?.user.id ?? null;

  // Onboarding (selezione interessi) è obbligatorio prima di poter vedere la Home.
  if (userId) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { interests: true },
    });
    if (currentUser && currentUser.interests.length === 0) redirect("/onboarding");
  }

  const continueJourneys = await getContinueJourneys(session);
  const excludeFromDiscovery = continueJourneys.map((item) => item.journeyId);

  const [followedFeed, followedUpdates, recommendedJourneys, recommendedCreators, categoryCounts] =
    await Promise.all([
      getFollowedCreatorsFeed({ userId, excludeJourneyIds: excludeFromDiscovery }),
      getFollowedCreatorsUpdates({ userId }),
      getRecommendedJourneys({ userId, excludeJourneyIds: excludeFromDiscovery }),
      getRecommendedCreators({ userId }),
      getJourneyCountsByCategory(),
    ]);

  const feedJourneyIds = followedFeed
    .filter((item) => item.type === "journey")
    .map((item) => item.journeyId);
  const newJourneys = await getNewJourneys([...excludeFromDiscovery, ...feedJourneyIds]);

  return (
    <main>
      <SiteHeader />
      {continueJourneys.length > 0 && <ContinueJourney items={continueJourneys} />}
      {followedFeed.length > 0 && <FollowedCreatorsFeed items={followedFeed} />}
      {followedUpdates.length > 0 && <FollowedCreatorsUpdates items={followedUpdates} />}
      <Hero />
      {recommendedJourneys.length > 0 && <RecommendedJourneys journeys={recommendedJourneys} />}
      {recommendedCreators.length > 0 && <RecommendedCreators creators={recommendedCreators} />}
      <NewJourneys journeys={newJourneys} />
      <Categories countByCategory={categoryCounts} />
      <StatsBar />
      <HowItWorks />
      <Faq />
      <FinalCta />
      <SiteFooter />
    </main>
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
      journey: { status: "PUBLISHED", deletedAt: null },
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
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <Reveal>
          <h2 className="font-sans text-2xl font-extrabold tracking-tight">
            Continue Your Journey
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <Reveal key={item.journeyId} delayMs={index * 80}>
              <Link
                href={item.episodeId ? `/journeys/${item.journeyId}#${item.episodeId}` : `/journeys/${item.journeyId}`}
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
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FEED DEI CREATOR SEGUITI                                             */
/* ------------------------------------------------------------------ */

function FollowedCreatorsFeed({ items }: { items: FeedItemData[] }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <Reveal>
          <h2 className="font-sans text-2xl font-extrabold tracking-tight">
            From creators you follow
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item, index) => (
            <Reveal
              key={item.type === "journey" ? item.journeyId : item.episodeId}
              delayMs={index * 60}
            >
              <FeedItem item={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* UPDATES DEI CREATOR SEGUITI                                          */
/* ------------------------------------------------------------------ */

function FollowedCreatorsUpdates({ items }: { items: FollowedUpdate[] }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <Reveal>
          <h2 className="font-sans text-2xl font-extrabold tracking-tight">
            Updates from creators you follow
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <Reveal key={item.id} delayMs={index * 60}>
              <UpdateCard update={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* HEADER                                                              */
/* ------------------------------------------------------------------ */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo className="h-6" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex">
          <Link href="/categories" className="hover:text-ink transition-colors">
            Discover
          </Link>
          <a href="#journey" className="hover:text-ink transition-colors">
            Journeys
          </a>
          <a href="#updates" className="hover:text-ink transition-colors">
            Updates
          </a>
          <a href="#" className="hover:text-ink transition-colors">
            About
          </a>
          <a href="#" className="hover:text-ink transition-colors">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden w-56 md:block">
            <SearchForm />
          </div>
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:text-ink md:hidden"
          >
            <SearchIcon className="h-4 w-4" />
          </Link>
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* RECOMMENDED JOURNEYS                                                */
/* ------------------------------------------------------------------ */

function RecommendedJourneys({ journeys }: { journeys: JourneyCardData[] }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <div className="mb-10">
            <h2 className="font-sans text-3xl font-extrabold tracking-tight">
              Recommended for you
            </h2>
            <p className="mt-2 text-ink-muted">Picked based on who you follow.</p>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {journeys.map((journey, index) => (
            <Reveal key={journey.id} delayMs={index * 80}>
              <JourneyCard journey={journey} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CREATOR CONSIGLIATI                                                 */
/* ------------------------------------------------------------------ */

function RecommendedCreators({ creators }: { creators: CreatorSearchResult[] }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <div className="mb-10">
            <h2 className="font-sans text-3xl font-extrabold tracking-tight">
              Creators to follow
            </h2>
            <p className="mt-2 text-ink-muted">People documenting journeys like the ones you follow.</p>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {creators.map((creator, index) => (
            <Reveal key={creator.id} delayMs={index * 80}>
              <CreatorResultCard creator={creator} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* NEW JOURNEYS                                                        */
/* ------------------------------------------------------------------ */

async function getNewJourneys(excludeJourneyIds: string[] = []): Promise<JourneyCardData[]> {
  const journeys = await prisma.journey.findMany({
    where: { status: "PUBLISHED", deletedAt: null, id: { notIn: excludeJourneyIds } },
    orderBy: { publishedAt: "desc" },
    take: 5,
    include: { creator: { include: { _count: { select: { followers: true } } } } },
  });

  if (journeys.length === 0) {
    // Nessun risultato può voler dire "nessun Journey pubblicato" (mostra la demo) oppure
    // "tutti i Journey pubblicati sono già esclusi" (es. tutti nel Feed): solo nel primo caso
    // ha senso il fallback demo, altrimenti la sezione resta vuota di proposito.
    const anyPublished = await prisma.journey.count({
      where: { status: "PUBLISHED", deletedAt: null },
    });
    return anyPublished === 0 ? DEMO_JOURNEYS : [];
  }

  return journeys.map((journey) => ({
    id: journey.id,
    title: journey.title,
    coverUrl: journey.coverUrl,
    category: journey.category,
    creator: { displayName: journey.creator.displayName },
    followersCount: journey.creator._count.followers,
  }));
}

function NewJourneys({ journeys }: { journeys: JourneyCardData[] }) {
  return (
    <section id="journey" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-sans text-3xl font-extrabold tracking-tight">
                New Journeys
              </h2>
              <p className="mt-2 text-ink-muted">Real stories. Real impact.</p>
            </div>
            <a
              href="#journey"
              className="hidden text-sm font-semibold text-ink-muted hover:text-ink transition-colors sm:block"
            >
              View all →
            </a>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {journeys.map((journey, index) => (
            <Reveal key={journey.id} delayMs={index * 80}>
              <JourneyCard journey={journey} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CATEGORIES                                                           */
/* ------------------------------------------------------------------ */

function Categories({ countByCategory }: { countByCategory: Map<string, number> }) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-sans text-3xl font-extrabold tracking-tight">
                Categories
              </h2>
              <p className="mt-2 text-ink-muted">Not sure where to start? Browse by category.</p>
            </div>
            <Link
              href="/categories"
              className="hidden text-sm font-semibold text-ink-muted hover:text-ink transition-colors sm:block"
            >
              View all →
            </Link>
          </div>
        </Reveal>

        <Reveal>
          <div className="flex flex-wrap gap-3">
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
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* STATS BAR                                                            */
/* ------------------------------------------------------------------ */

function StatsBar() {
  const stats = [
    { value: "10K+", label: "Creators" },
    { value: "2M+", label: "Followers" },
    { value: "1.5M+", label: "Journeys started" },
    { value: "98%", label: "Positive impact" },
  ];

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delayMs={index * 100} className="text-center md:text-left">
            <p className="font-sans text-3xl font-black md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{stat.label}</p>
          </Reveal>
        ))}
      </div>
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
    <section id="how-it-works" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <h2 className="mb-14 font-sans text-3xl font-extrabold tracking-tight">
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
    <section id="faq" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <Reveal>
          <h2 className="mb-10 font-sans text-3xl font-extrabold tracking-tight">
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
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FINAL CTA                                                            */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <Reveal>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight md:text-4xl">
            Your Journey starts from ZERO.
          </h2>
          <p className="mt-4 text-ink-muted">
            Sign up and discover the transformations that are already inspiring the community.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-bg hover:bg-ink-muted transition-colors"
            >
              Create your account
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FOOTER                                                               */
/* ------------------------------------------------------------------ */

function SiteFooter() {
  return (
    <footer>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-ink-muted sm:flex-row">
        <Logo className="h-6" />
        <p>© {new Date().getFullYear()} Zero. Every journey starts from zero.</p>
      </div>
    </footer>
  );
}
