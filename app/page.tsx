import Image from "next/image";
import Link from "next/link";
import { Compass, Flame, Video as VideoIcon, Star, ArrowRight, Sparkles, UserPlus } from "lucide-react";
import { JourneyCard, type JourneyCardData } from "@/components/journey/JourneyCard";
import { MomentJourneyCard } from "@/components/journey/MomentJourneyCard";
import { VideoCard } from "@/components/journey/VideoCard";
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
  DEMO_STORIES,
  DEMO_CREATORS,
  DEMO_LATEST_VIDEOS,
  DEMO_TOP_JOURNEYS,
  DEMO_DISCOVERING_NOW,
} from "@/lib/demo/demoContent";
import { getRecommendedJourneys } from "@/lib/discovery/recommendedJourneys";
import { getRecommendedCreators } from "@/lib/discovery/recommendedCreators";
import { getFollowedCreatorsStories } from "@/lib/discovery/stories";
import { getLatestVideos } from "@/lib/discovery/latestVideos";
import { getTopJourneys } from "@/lib/discovery/topJourneys";
import { getDiscoveringNowJourneys, type DiscoveringNowItem } from "@/lib/discovery/discoveringNow";
import { getContinueJourneys } from "@/lib/discovery/continueJourneys";
import { StoriesRow } from "@/components/home/StoriesRow";
import { getJourneyCountsByCategory } from "@/lib/discovery/categories";
import { JOURNEY_CATEGORIES, categoryToSlug } from "@/lib/constants/categories";
import { promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
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

  // "Continue Your Journey" non si mostra più qui (si sposterà sulla home del Profilo), ma
  // l'elenco resta calcolato: serve a escludere dalle righe di scoperta i Journey che l'utente
  // sta già seguendo passo passo.
  const continueJourneys = await getContinueJourneys(session);
  const excludeFromDiscovery = continueJourneys.map((item) => item.journeyId);

  const [
    creatorStories,
    recommendedJourneys,
    recommendedCreators,
    categoryCounts,
    momentJourneys,
    latestVideos,
    topJourneys,
    discoveringNow,
  ] = await Promise.all([
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

  // DEMO DATA - replace when real data available: placeholder realistici per le sezioni
  // ancora vuote (nessun dato reale sufficiente), per una demo visiva completa. Ogni sezione
  // torna automaticamente ai dati reali non appena ce ne sono abbastanza, nessuna struttura da toccare.
  // "Journeys of the Moment" mostra solo 4 Journey in Home: il resto si vede in "View all".
  const displayedMomentJourneys = (momentJourneys.length > 0 ? momentJourneys : DEMO_JOURNEYS).slice(0, 4);
  const displayedLatestVideos = latestVideos.length > 0 ? latestVideos : DEMO_LATEST_VIDEOS;
  const displayedTopJourneys = topJourneys.length > 0 ? topJourneys : DEMO_TOP_JOURNEYS;
  const displayedDiscoveringNow = discoveringNow.length > 0 ? discoveringNow : DEMO_DISCOVERING_NOW;
  const displayedStories = creatorStories.length > 0 ? creatorStories : DEMO_STORIES;
  const displayedRecommendedJourneys = recommendedJourneys.length > 0 ? recommendedJourneys : DEMO_JOURNEYS.slice(0, 5);
  const displayedRecommendedCreators = recommendedCreators.length > 0 ? recommendedCreators : DEMO_CREATORS;

  return (
    <main>
      <Header />
      {userId && needsOnboarding && <OnboardingBanner userId={userId} />}
      <Hero />

      {/* Updates: solo per chi ha fatto il sign in, subito sotto la Hero */}
      {userId && <StoriesRow stories={displayedStories} />}

      <div id="discover">
        <DiscoveringNow journeys={displayedDiscoveringNow} />
        <LatestVideos videos={displayedLatestVideos} />
        <JourneysOfTheMoment journeys={displayedMomentJourneys} />
        <TopJourneys journeys={displayedTopJourneys} />
      </div>

      <RecommendedJourneys journeys={displayedRecommendedJourneys} />
      <RecommendedCreators creators={displayedRecommendedCreators} />
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
      <div className="rounded-2xl border border-border bg-ink/[0.02] p-4 md:p-5">
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
                  <p className="mt-2 text-xs text-ink-muted">
                    {journey.daysLeft} {journey.daysLeft === 1 ? "day" : "days"} left in Discovery
                  </p>
                }
              />
            </Reveal>
          ))}
        </ul>
      </div>
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
