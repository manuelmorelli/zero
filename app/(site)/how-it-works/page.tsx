import {
  AlertTriangle,
  Ban,
  ChevronRight,
  Clock,
  Eye,
  FileVideo,
  Maximize,
  Rocket,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ButtonSecondary } from "@/components/ui/button";
import { ScrollStory } from "@/components/common/ScrollStory";
import { CardTitle, DisplayTitle, ReadingTitle } from "@/components/ui/heading";
import { PANEL, PANEL_ACCENT, PANEL_GLASS } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";

export const metadata = {
  title: "How It Works | Zero",
  description:
    "Three steps to get started, the questions people ask most, how to publish and upload, and why Zero decides what you see by trust, not by fame or followers.",
};

// Esportati per Ember (lib/ai/siteAssistant.ts): stesso testo di questa pagina, nessuna copia a parte.
export const algorithmParagraphs = [
  "Today, anyone can fake a number. Bought followers, inflated views, quick content made to be watched for two seconds and forgotten. With millions of things to watch and no real way to check who is behind any of it, trust has become the rarest thing online.",
  "Zero works the other way around: it's built on trust, not fame. And trust can't be faked. Nobody can fake actually watching an episode all the way through, and coming back for the next one.",
];

export const trustyExplainer =
  "Zero has no like button. It has Trusty: you can only give it after watching an episode all the way through, never before. It's not a quick click, it's a real vote of trust. The more people give Trusty to a Journeyer, the more their Trust Score grows.";

export const trustClosingLine =
  "That's why on Zero, quality told over time wins, not whoever posts today's most viral dance clip.";

export const mistakesNote =
  "Zero isn't asking for a highlight reel. A Journeyer who's honest about a failed attempt, a slow week, or a plan that didn't work earns more trust than one who only shows the wins. Real beats perfect, every time.";

type OrderPhase = { icon: LucideIcon; tag: string; title: string; text: string };

export const orderPhases: OrderPhase[] = [
  {
    icon: Clock,
    tag: "Right now, while Zero is new",
    title: "Chronological order. Period.",
    text: "The newest Journeys show up first, based only on when they were published, like a list sorted by date. No calculation, no formula: whoever posts today is seen today, in the same order for everyone.",
  },
  {
    icon: Sparkles,
    tag: "After 100 published Journeys",
    title: "Zero's algorithm switches on.",
    text: "From that point on, on top of the chronological order, it starts giving the best Journeys an extra push. What matters most is who finishes their episodes all the way through, who publishes regularly, and how much real time people spend watching. Followers help a little, but only up to a point, past that having more doesn't push you any higher. The chronological order stays on for everyone, the algorithm adds to it, it never replaces it.",
  },
];

type Definition = { icon: LucideIcon; title: string; text: string };

export const algorithmQuickAnswers: Definition[] = [
  {
    icon: Eye,
    title: "Can my Journey get buried?",
    text: "No. Every new Journey is shown to everyone for its first 15 days, no matter what. After that, finishing what you start keeps you visible far more than any follower count does.",
  },
  {
    icon: Ban,
    title: "Can someone pay to be seen more?",
    text: "No. On Zero, a Journey rises only because people actually watch it and come back, never because someone paid for it.",
  },
  {
    icon: Users,
    title: "Do followers matter at all?",
    text: "A little, but only up to a point. A Journeyer with 5 followers that everyone finishes is shown to more people than one with 600 followers that nobody finishes.",
  },
  {
    icon: Rocket,
    title: "What actually earns you a push?",
    text: "People finishing your episodes, you publishing regularly, and real watch time, not a view that lasted two seconds.",
  },
];

export const publishingNote =
  "On Zero, publishing an episode isn't final. Found a mistake, or want to make it better? You can swap the video for a new one (it keeps its spot in your Journey, and all its likes and views). Other apps make you delete everything and start again with no views. Zero doesn't.";

export const steps = [
  {
    number: "01",
    title: "Choose a Journey",
    text: "Browse real Journeys documented by other people and choose the one closest to what you're looking for.",
  },
  {
    number: "02",
    title: "Follow it chapter by chapter",
    text: "Pick up exactly where you left off, just like a streaming platform.",
  },
  {
    number: "03",
    title: "Build your own",
    text: "Become a journeyer and document your Journey, mistakes included.",
  },
];

export const questions = [
  {
    q: "What is a Journey?",
    a: "It's a real path, told in chapters and episodes: not just the final outcome, but the whole process.",
  },
  {
    q: "Is Zero free?",
    a: "Yes, following Journeys and using Zero as a viewer is free. Some journeyers offer paid communities, workshops, or services.",
  },
  {
    q: "Can I become a journeyer?",
    a: "Yes. Create a journeyer profile and publish your first Journey (in the first version you can have one active Journey at a time).",
  },
  {
    q: "Is my data safe?",
    a: "Yes, payments go through Stripe only and your data is never shared with third parties without your consent.",
  },
];

type Bullet = { icon: LucideIcon; text: string };

export const uploadTips: Bullet[] = [
  { icon: FileVideo, text: "Export as MP4, it works everywhere and keeps quality high." },
  {
    icon: UploadCloud,
    text: "Upload your original file, not a copy you already posted somewhere else (every re-upload loses a little quality).",
  },
  {
    icon: Maximize,
    text: "Keep your original resolution (1080p or higher). Zero never compresses or replaces your original file, it always stays exactly as you uploaded it.",
  },
];

function BulletList({ items }: { items: Bullet[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map(({ icon: Icon, text }) => (
        <li key={text} className="flex gap-3 text-sm leading-relaxed text-ink">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ember-line bg-ember-soft text-ember">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="pt-1">{text}</span>
        </li>
      ))}
    </ul>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen text-ink">
      <main className={cn(PAGE_WIDTH.wide, "relative max-w-3xl pb-10 pt-16 md:pt-20")}>
        {/* Racconto con lo scroll: il titolo si allontana, le righe salgono una dopo l'altra, le
         * due frasi arancioni entrano di lato, passi, domande e riquadri salgono uno alla volta. */}
        <ScrollStory>
          <div data-story="title">
            <p className="inline-flex items-center gap-2 rounded-full border border-ember-line bg-ember-soft px-3 py-1 text-sm uppercase tracking-[0.32em] text-ember">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              How Zero really works
            </p>
            <DisplayTitle className="mt-2">
              How It <span className="text-ember">Works</span>
            </DisplayTitle>
            <p className="mt-2 text-ink">
              Three steps to get started, the questions people ask most, and why trust decides what you see.
            </p>
          </div>

          <div data-story="lines">
            <ReadingTitle className="mb-4 mt-8">Three Steps to Get Started</ReadingTitle>
          </div>
          <div data-story="rise" className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className={PANEL}>
                <span className="text-sm font-bold text-ink-faint">{step.number}</span>
                <CardTitle as="h2" className="mt-2 text-ember">{step.title}</CardTitle>
                <p className="mt-1.5 text-ink">{step.text}</p>
              </div>
            ))}
          </div>

          <div data-story="lines">
            <ReadingTitle className="mb-4 mt-10">Frequently Asked Questions</ReadingTitle>
          </div>
          <div data-story="rise" className={cn(PANEL, "divide-y divide-border")}>
            {questions.map((item) => (
              <details key={item.q} className="group py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-ember">
                  {item.q}
                  <span className="ml-4 text-ink transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-ink">{item.a}</p>
              </details>
            ))}
          </div>

          <div data-story="rise" className="mt-10 grid items-start gap-4 sm:grid-cols-2">
            <section className={PANEL_ACCENT}>
              <CardTitle as="h2" className="text-ember">Publishing Isn&apos;t the End</CardTitle>
              <p className="mt-3 text-sm leading-relaxed text-ink">{publishingNote}</p>
            </section>
            <section className={PANEL_ACCENT}>
              <CardTitle as="h2" className="text-ember">Before You Upload</CardTitle>
              <BulletList items={uploadTips} />
            </section>
          </div>

          <div data-story="lines">
            <ReadingTitle id="algorithm" className="mb-3 mt-10 scroll-mt-24">
              Trust First. Always.
            </ReadingTitle>
            <p className="text-ink">
              Not the algorithm first, not followers first.
              <br />
              Here is how Zero actually decides what you see.
            </p>
          </div>

          {/* La fiducia prima di tutto: perché conta, cos'è Trusty, come si differenzia dagli altri
           * social. Martellare sulla parola fiducia, è il cuore di questa sezione. */}
          <div data-story="rise" className={cn(PANEL_ACCENT, "mt-6 flex flex-col gap-4")}>
            <span className="inline-flex w-fit items-center rounded-full bg-ember-soft px-2.5 py-1 text-sm font-bold uppercase tracking-[0.14em] text-ember">
              Trust before everything
            </span>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ember-line bg-ember-soft text-ember">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <CardTitle className="text-lg">Why trust, not fame?</CardTitle>
            </div>
            {algorithmParagraphs.map((text, index) => (
              <p
                key={text.slice(0, 30)}
                className={cn("leading-relaxed", index === 0 ? "font-semibold text-ink" : "text-ink-muted")}
              >
                {text}
              </p>
            ))}
            <div className={cn(PANEL_GLASS, "flex flex-col gap-1.5")}>
              <p className="font-bold text-ink">The Trusty button</p>
              <p className="text-sm leading-relaxed text-ink-muted">{trustyExplainer}</p>
            </div>
            <p className="font-semibold text-ink">{trustClosingLine}</p>
          </div>

          {/* Mostrare un errore crea fiducia: subito dopo il blocco sulla fiducia, non in fondo. */}
          <div data-story="rise" className={cn(PANEL_ACCENT, "mt-4 flex flex-col gap-3")}>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ember-line bg-ember-soft text-ember">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              </span>
              <CardTitle className="text-lg text-ember">
                Showing a mistake builds more trust than hiding one
              </CardTitle>
            </div>
            <p className="leading-relaxed text-ink">{mistakesNote}</p>
          </div>

          {/* Oggi ordine cronologico, dopo 100 Journey l'algoritmo si aggiunge: le due fasi affiancate. */}
          <div data-story="rise" className="mt-6 flex flex-wrap items-center gap-4">
            {orderPhases.map((phase, index) => (
              <div key={phase.title} className="flex flex-1 items-center gap-4" style={{ minWidth: "260px" }}>
                <div className={cn(PANEL, "flex flex-1 flex-col gap-2")}>
                  <span className="inline-flex w-fit items-center rounded-full bg-ember-soft px-2.5 py-1 text-sm font-bold uppercase tracking-[0.14em] text-ember">
                    {phase.tag}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ember-line bg-ember-soft text-ember">
                      <phase.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <p className="font-semibold text-ink">{phase.title}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted">{phase.text}</p>
                </div>
                {index === 0 && (
                  <ChevronRight className="hidden h-6 w-6 shrink-0 text-ember md:block" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm italic text-ink-faint">
            Why 100: it's enough Journeys that &quot;the best ones&quot; actually means something, not almost the
            whole catalog.
          </p>

          <div data-story="lines">
            <ReadingTitle className="mb-3 mt-8">A Few Straight Answers</ReadingTitle>
          </div>
          <div data-story="rise" className="grid gap-3 sm:grid-cols-2">
            {algorithmQuickAnswers.map((item) => (
              <div key={item.title} className={cn(PANEL, "flex flex-col gap-2.5")}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ember-line bg-ember-soft text-ember">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <p className="text-sm leading-relaxed text-ink-muted">{item.text}</p>
              </div>
            ))}
          </div>

          <p
            data-story="finale"
            className={cn(PANEL, "mt-6 text-2xl font-black leading-snug tracking-tight text-ember md:text-3xl")}
          >
            That&apos;s why trust decides what grows on Zero, not luck and not volume.
          </p>
        </ScrollStory>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonSecondary href="/">Explore Journeys</ButtonSecondary>
          <ButtonSecondary href="/dashboard">Create Your Journey</ButtonSecondary>
        </div>
      </main>
    </div>
  );
}
