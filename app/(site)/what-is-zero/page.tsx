import {
  BadgeCheck,
  Camera,
  Clock,
  Code2,
  Compass,
  Eye,
  Footprints,
  Layers,
  ListOrdered,
  Music,
  MousePointerClick,
  Palette,
  PlayCircle,
  Shirt,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { ButtonSecondary } from "@/components/ui/button";
import { ScrollStory } from "@/components/common/ScrollStory";
import { CardTitle, DisplayTitle, ReadingTitle, SectionTitle } from "@/components/ui/heading";
import { PANEL, PANEL_ACCENT } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import { PAGE_WIDTH } from "@/components/ui/page-container";

export const metadata = {
  title: "What Is Zero | Journeys told as they happen",
  description:
    "Zero is built around Journeys: real paths documented from the very first day. Reputation earned over time, ranked by Trust Score instead of likes.",
};

// Esportati per Ember (lib/ai/siteAssistant.ts): stesso testo di questa pagina, nessuna copia a parte.
export const paragraphs = [
  "Most of the time, we only see people after they've already made it. The result, the success, the finish line. We almost never see how they got there.",
  "Zero shows the whole path, from day one: the doubts, the failed attempts, the small wins.",
  "Life itself is made of Journeys, big and small. Learning something new. Building something. Starting over. Each one deserves its own place, from the very first day.",
  "On Zero, you don't win by getting the most likes. You earn trust over time, by actually finishing what you start, Episode after Episode.",
  "That's why Zero looks at whether people watch, come back, and finish a Journey, not just how many views a video gets.",
  "Every great story starts the same way: someone decided to begin.",
];

const highlighted = new Set([paragraphs[1], paragraphs[4]]);

type Bullet = { icon: LucideIcon; text: string };
type Definition = { icon: LucideIcon; title: string; text: string };

// La definizione di Journey guida sempre le altre: è quella che le persone capiscono male
// (pensano a un viaggio), quindi sta per prima e a tutta larghezza nel rendering sotto.
export const quickAnswers: Definition[] = [
  {
    icon: TrendingUp,
    title: "What is a Journey?",
    text:
      "Not a trip. Not a vacation. A Journey is a real goal someone is working toward, filmed as it actually happens: leaving a desk job to open a plant shop. Learning to DJ and playing a first real gig. Training for a first triathlon. Opening a pop-up food stand with your grandmother's recipes. If it takes time and effort, it can be a Journey.",
  },
  {
    icon: Compass,
    title: "What is Zero?",
    text:
      "A place to follow someone's real path in life, filmed as it happens, not polished after the fact. You don't just see the finish line, you see every step that got them there.",
  },
  {
    icon: UserRound,
    title: "What is a Journeyer?",
    text:
      "The person telling that story. Not an actor, not a highlight reel, just someone letting you watch the real attempt, including the parts that don't go well.",
  },
  {
    icon: PlayCircle,
    title: "How do I use it?",
    text:
      "Watch anything for free, from Episode one. You only need an account to follow someone, give Trusty, join the Forum, or save a Journey for later.",
  },
];

export const journeyExamples: Bullet[] = [
  { icon: Camera, text: "Teaching yourself photography and booking a first paid shoot." },
  { icon: Shirt, text: "Starting a small clothing brand from your bedroom." },
  { icon: Footprints, text: "Training for a half marathon." },
  { icon: Music, text: "Learning to produce music and releasing a first track." },
  { icon: Video, text: "Growing a YouTube channel with no subscribers to start." },
  { icon: Zap, text: "Teaching yourself to skate at the park near your house." },
  { icon: Code2, text: "Building an app and shipping the first version." },
  { icon: Palette, text: "Teaching yourself to paint and selling a first piece." },
];

export const different: Bullet[] = [
  { icon: ListOrdered, text: "Episodes are watched in chronological order, from the very first one." },
  { icon: Layers, text: "Drag & drop reordering directly on your cards." },
  { icon: ShieldCheck, text: "Ranked by Trust Score, not likes." },
  { icon: Eye, text: "Every new Journey gets 15 days of guaranteed visibility to everyone." },
];

export const howItWorks: Bullet[] = [
  { icon: Compass, text: "A Presentation, optional Chapters, and Episodes." },
  { icon: Clock, text: "Resume any episode exactly where you left off." },
  { icon: MousePointerClick, text: "Publishing takes two clicks, maximum." },
  {
    icon: BadgeCheck,
    text: "You can watch without an account. An account is only needed to follow, give Trusty, join the Forum, or save.",
  },
];

function BulletList({ items }: { items: Bullet[] }) {
  return (
    <ul className="mt-4 space-y-3">
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

export default function WhatIsZeroPage() {
  const [journeyAnswer, ...otherAnswers] = quickAnswers;

  return (
    <div className="min-h-screen text-ink">
      <main className={cn(PAGE_WIDTH.wide, "relative max-w-3xl pb-10 pt-10 md:pt-14")}>
        <ScrollStory>
          <div data-story="title">
            <p className="inline-flex items-center gap-2 rounded-full border border-ember-line bg-ember-soft px-3 py-1 text-sm uppercase tracking-[0.32em] text-ember">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Every journey starts from
            </p>
            <DisplayTitle className="mt-2">
              What is <span className="text-ember">Zero</span>
            </DisplayTitle>
          </div>

          {/* Blocchi semplici e diretti, visibili senza troppo scroll: la definizione di Journey
           * guida perché è quella che le persone capiscono male (pensano a un viaggio). */}
          <div className="mt-4 flex flex-col gap-3">
            <div className={cn(PANEL_ACCENT, "flex flex-col gap-3")}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ember-line bg-ember-soft text-ember">
                  <journeyAnswer.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <CardTitle>{journeyAnswer.title}</CardTitle>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">{journeyAnswer.text}</p>
            </div>

            <div data-story="rise" className="grid gap-3 sm:grid-cols-3">
              {otherAnswers.map((item) => (
                <div key={item.title} className={cn(PANEL, "flex flex-col gap-2.5")}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ember-line bg-ember-soft text-ember">
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <p className="text-sm leading-relaxed text-ink-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Il racconto si legge mentre si scorre: le righe salgono una dopo l'altra, le frasi
           * arancioni entrano in riquadri, l'ultima cresce fino a riempire lo spazio. */}
          <div className="mt-8 flex flex-col gap-3">
            <ReadingTitle>Why Zero Exists</ReadingTitle>
            {paragraphs.map((text) =>
              highlighted.has(text) ? (
                <div key={text.slice(0, 40)} data-story="rise">
                  <p className={cn(PANEL_ACCENT, "text-lg font-semibold leading-snug tracking-tight text-ember sm:text-xl")}>
                    {text}
                  </p>
                </div>
              ) : (
                <p key={text.slice(0, 40)} data-story="lines" className="text-base leading-relaxed text-ink">
                  {text}
                </p>
              )
            )}
            <p
              data-story="finale"
              className={cn(PANEL, "relative overflow-hidden text-2xl font-black leading-snug tracking-tight text-ember sm:text-3xl")}
            >
              That's why every Journey on Zero starts from Zero.
            </p>
          </div>

          <div data-story="rise" className={cn(PANEL_ACCENT, "mt-6")}>
            <SectionTitle>A Journey Can Be</SectionTitle>
            <p className="mt-1 text-sm text-ink-muted">Not a trip. Not a vacation. A few more real ones:</p>
            <div className="grid sm:grid-cols-2 sm:gap-x-6">
              <BulletList items={journeyExamples.slice(0, 4)} />
              <BulletList items={journeyExamples.slice(4)} />
            </div>
          </div>

          <div data-story="rise" className="mt-6 grid items-start gap-4 sm:grid-cols-2">
            <section className={PANEL_ACCENT}>
              <SectionTitle>What Makes Zero Different</SectionTitle>
              <BulletList items={different} />
            </section>
            <section className={PANEL_ACCENT}>
              <SectionTitle>How It Works</SectionTitle>
              <BulletList items={howItWorks} />
            </section>
          </div>

          <p className="mt-5 text-sm text-ink">
            Curious how the algorithm actually decides what to show?{" "}
            <Link href="/how-it-works#algorithm" className="font-semibold text-ember hover:underline">
              Know the Algorithm. Know Zero.
            </Link>
          </p>
        </ScrollStory>

        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonSecondary href="/">Explore Journeys</ButtonSecondary>
          <ButtonSecondary href="/dashboard">Create Your Journey</ButtonSecondary>
        </div>
      </main>
    </div>
  );
}
