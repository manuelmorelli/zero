import { FileVideo, Maximize, Sparkles, UploadCloud, type LucideIcon } from "lucide-react";
import { ButtonSecondary } from "@/components/ui/button";
import { ScrollStory } from "@/components/common/ScrollStory";
import { CardTitle, DisplayTitle, ReadingTitle } from "@/components/ui/heading";
import { PANEL, PANEL_ACCENT } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";

export const metadata = {
  title: "Know the Algorithm. Know Zero.",
  description:
    "Three steps to get started, the questions people ask most, how Zero's algorithm actually decides what to show, and tips for uploading the best quality video.",
};

// Esportati per Ember (lib/ai/siteAssistant.ts): stesso testo di questa pagina, nessuna copia a parte.
export const algorithmParagraphs = [
  "The algorithm doesn't care how many followers you have. It cares about one thing: do people actually stick around and come back?",
  "If people finish your episodes and come back for the next one, more people get to see you. Followers help a little, but only up to a point. After that, having more doesn't push you higher.",
  "The only way your score goes down is if people report you and we confirm something was actually wrong. Never because you're small.",
];

export const algorithmHighlights = [
  "A creator with 5 followers, where everyone finishes every episode, is shown to more people than a creator with 600 followers that nobody finishes.",
  "Paying doesn't get you seen more. On Zero, a Journey rises only because people actually watch and love it, never because someone paid for it.",
];

export const publishingNote =
  "On Zero, publishing an episode isn't final. Found a mistake, or want to make it better? You can swap the video for a new one (it keeps its spot in your Journey, and all its likes and views). Other apps make you delete everything and start again with no views. Zero doesn't.";

export const steps = [
  {
    number: "01",
    title: "Choose a Journey",
    text: "Browse real transformations from other people and choose the one that inspires you most.",
  },
  {
    number: "02",
    title: "Follow it chapter by chapter",
    text: "Pick up exactly where you left off, just like a streaming platform.",
  },
  {
    number: "03",
    title: "Build your own",
    text: "Become a creator and document your transformation, mistakes included.",
  },
];

export const questions = [
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
    a: "Yes. Create a creator profile and publish your first Journey (in the first version you can have one active Journey at a time).",
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
              Know the Algorithm. Know <span className="text-ember">Zero</span>.
            </DisplayTitle>
            <p className="mt-2 text-ink">
              Three steps to get started, the questions people ask most, and how everything really works.
            </p>
          </div>

          <div data-story="lines">
            <ReadingTitle id="algorithm" className="mb-3 mt-8 scroll-mt-24">
              How the algorithm decides what to show
            </ReadingTitle>
          </div>
          <div className="space-y-3 text-ink">
            {algorithmParagraphs.map((text) => (
              <p key={text.slice(0, 30)} data-story="lines">
                {text}
              </p>
            ))}
          </div>
          {algorithmHighlights.map((text) => (
            <div key={text.slice(0, 30)} data-story="rise" className="mt-4">
              <p className={cn(PANEL_ACCENT, "text-lg font-semibold leading-snug tracking-tight text-ember sm:text-xl")}>
                {text}
              </p>
            </div>
          ))}

          <div data-story="lines">
            <ReadingTitle className="mb-4 mt-10">Three Steps to Get Started</ReadingTitle>
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
        </ScrollStory>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonSecondary href="/">Explore Journeys</ButtonSecondary>
          <ButtonSecondary href="/dashboard">Create Your Journey</ButtonSecondary>
        </div>
      </main>
    </div>
  );
}
