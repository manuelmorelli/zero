import Link from "next/link";

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <Hero />
      <ExploreJourneys />
      <StatsBar />
      <HowItWorks />
      <Faq />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* HEADER                                                              */
/* ------------------------------------------------------------------ */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <span className="font-sans text-xl font-extrabold tracking-tight">
          ZERO
        </span>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex">
          <a href="#journey" className="hover:text-ink transition-colors">
            Discover
          </a>
          <a href="#journey" className="hover:text-ink transition-colors">
            Journeys
          </a>
          <a href="#how-it-works" className="hover:text-ink transition-colors">
            How it works
          </a>
          <a href="#faq" className="hover:text-ink transition-colors">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-ink-muted hover:text-ink transition-colors sm:block"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg hover:bg-ink-muted transition-colors"
          >
            Start now
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* HERO                                                                 */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-muted">
            Every journey starts from
          </p>
          <h1 className="mt-4 font-sans text-6xl font-black leading-[0.95] tracking-tight md:text-8xl">
            ZERO
          </h1>
          <p className="mt-6 max-w-md text-lg font-semibold text-ink">
            The platform for real people building real transformations.
          </p>
          <p className="mt-3 max-w-md text-ink-muted">
            Share your journey. Inspire others. Grow with those who follow you.
            This isn't content: it's change.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#journey"
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg hover:bg-ink-muted transition-colors"
            >
              ▶ Explore Journeys
            </a>
            <Link
              href="/signup"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-ink hover:border-ink transition-colors"
            >
              Create your Journey
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-9 w-9 rounded-full border-2 border-bg bg-surface-2"
                />
              ))}
            </div>
            <p className="text-sm text-ink-muted">
              Thousands of creators, millions of followers
            </p>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-surface-2 to-bg">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="px-8 text-center text-xs text-ink-faint">
              Hero image — replace with a real photo in public/images/hero.jpg
            </p>
          </div>
          <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-border bg-bg/70 p-4 backdrop-blur">
            <p className="text-sm text-ink">
              “Zero changed the way I tell and share my journey.”
            </p>
            <p className="mt-2 text-xs text-ink-muted">— Alex R.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* EXPLORE JOURNEYS                                                     */
/* ------------------------------------------------------------------ */

function ExploreJourneys() {
  const journeys = [
    { title: "From burnout to balance", creator: "Marco R.", followers: "24K", category: "Wellness" },
    { title: "Stronger every day", creator: "Sara J.", followers: "18K", category: "Fitness" },
    { title: "Ride the unknown", creator: "David L.", followers: "31K", category: "Sport" },
    { title: "See the world differently", creator: "Emma W.", followers: "16K", category: "Creativity" },
    { title: "Build my startup", creator: "James T.", followers: "29K", category: "Career" },
  ];

  return (
    <section id="journey" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-sans text-3xl font-extrabold tracking-tight">
              Featured Journeys
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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {journeys.map((journey) => (
            <div
              key={journey.title}
              className="group overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-ink-muted"
            >
              <div className="aspect-[3/4] w-full bg-surface-2" />
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  {journey.category}
                </p>
                <h3 className="mt-2 text-sm font-bold leading-snug">
                  {journey.title}
                </h3>
                <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
                  <span>by {journey.creator}</span>
                  <span>{journey.followers}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
        {stats.map((stat) => (
          <div key={stat.label} className="text-center md:text-left">
            <p className="font-sans text-3xl font-black md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{stat.label}</p>
          </div>
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
        <h2 className="mb-14 font-sans text-3xl font-extrabold tracking-tight">
          How it works
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number}>
              <span className="text-sm font-bold text-ink-faint">
                {step.number}
              </span>
              <h3 className="mt-3 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-ink-muted">{step.text}</p>
            </div>
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
        <h2 className="mb-10 font-sans text-3xl font-extrabold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-border">
          {questions.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">
                {item.q}
                <span className="ml-4 text-ink-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-ink-muted">{item.a}</p>
            </details>
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
        <h2 className="font-sans text-3xl font-extrabold tracking-tight md:text-4xl">
          Your Journey starts from ZERO.
        </h2>
        <p className="mt-4 text-ink-muted">
          Sign up and discover the transformations that are already inspiring the community.
        </p>
        <div className="mt-8">
          <Link
            href="/signup"
            className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-bg hover:bg-ink-muted transition-colors"
          >
            Create your account
          </Link>
        </div>
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
        <span className="font-sans font-extrabold text-ink">ZERO</span>
        <p>© {new Date().getFullYear()} Zero. Every journey starts from zero.</p>
      </div>
    </footer>
  );
}
