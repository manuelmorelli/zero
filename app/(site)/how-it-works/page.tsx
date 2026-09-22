import { FileVideo, Maximize, Sparkles, UploadCloud, type LucideIcon } from "lucide-react";
import { ButtonPrimary, ButtonSecondary } from "@/components/common/Button";
import { Reveal } from "@/components/common/Reveal";

export const metadata = {
  title: "Know the Algorithm. Know Zero.",
  description:
    "Three steps to get started, the questions people ask most, how Zero's algorithm actually decides what to show, and tips for uploading the best quality video.",
};

const steps = [
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
    a: "Yes. Create a creator profile and publish your first Journey (in the first version you can have one active Journey at a time).",
  },
  {
    q: "Is my data safe?",
    a: "Yes, payments go through Stripe only and your data is never shared with third parties without your consent.",
  },
];

type Bullet = { icon: LucideIcon; text: string };

const uploadTips: Bullet[] = [
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
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ember/30 bg-ember/10 text-ember">
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
    <div className="min-h-screen bg-bg text-ink">
      <main className="relative mx-auto max-w-3xl px-5 pb-10 pt-16 md:px-8 md:pt-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[120px]"
        />
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-ember/30 bg-ember/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-ember">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            How Zero really works
          </p>
          <h1 className="mt-2 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
            Know the Algorithm. Know{" "}
            <span className="bg-gradient-to-br from-ember to-ember/50 bg-clip-text text-transparent">
              Zero
            </span>
            .
          </h1>
          <p className="mt-2 text-ink">
            Three steps to get started, the questions people ask most, and how everything really works.
          </p>
        </Reveal>

        <Reveal delayMs={100}>
          <h2
            id="algorithm"
            className="mb-3 mt-8 scroll-mt-24 text-[1.73rem] font-bold tracking-tight text-ember sm:text-[2.16rem]"
          >
            How the algorithm decides what to show
          </h2>
        </Reveal>
        <Reveal delayMs={140}>
          <div className="space-y-3 text-ink">
            <p>
              The algorithm doesn&apos;t care how many followers you have. It cares about one thing: do
              people actually stick around and come back?
            </p>
            <p>
              If people finish your episodes and come back for the next one, more people get to see
              you. Followers help a little, but only up to a point. After that, having more
              doesn&apos;t push you higher.
            </p>
            <p>
              The only way your score goes down is if people report you and we confirm something was
              actually wrong. Never because you&apos;re small.
            </p>
          </div>
        </Reveal>
        <Reveal delayMs={180}>
          <p className="mt-4 rounded-2xl border border-ember/25 bg-gradient-to-r from-ember/12 to-transparent px-5 py-4 text-lg font-semibold leading-snug tracking-tight text-ember sm:text-xl">
            A creator with 5 followers, where everyone finishes every episode, is shown to more people
            than a creator with 600 followers that nobody finishes.
          </p>
        </Reveal>
        <Reveal delayMs={200}>
          <p className="mt-4 rounded-2xl border border-ember/25 bg-gradient-to-r from-ember/12 to-transparent px-5 py-4 text-lg font-semibold leading-snug tracking-tight text-ember sm:text-xl">
            Paying doesn&apos;t get you seen more. On Zero, a Journey rises only because people
            actually watch and love it, never because someone paid for it.
          </p>
        </Reveal>

        <Reveal delayMs={100}>
          <h2 className="mb-4 mt-10 text-[1.73rem] font-bold tracking-tight text-ember sm:text-[2.16rem]">
            Three steps to get started
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.number} delayMs={index * 120}>
              <span className="text-sm font-bold text-ink-faint">{step.number}</span>
              <h2 className="mt-2 text-[1.29rem] font-bold text-ember">{step.title}</h2>
              <p className="mt-1.5 text-ink">{step.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={100}>
          <h2 className="mb-4 mt-10 text-[1.73rem] font-bold tracking-tight text-ember sm:text-[2.16rem]">
            Frequently asked questions
          </h2>
        </Reveal>
        <div className="divide-y divide-border">
          {questions.map((item, index) => (
            <Reveal key={item.q} delayMs={index * 60}>
              <details className="group py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[1.15rem] font-semibold text-ember">
                  {item.q}
                  <span className="ml-4 text-ink transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-ink">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Reveal>
            <section className="h-full rounded-2xl border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] p-5">
              <h2 className="text-[1.15rem] font-bold tracking-tight text-ember">Publishing isn&apos;t the end</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink">
                On Zero, publishing an episode isn&apos;t final. Found a mistake, or want to make it
                better? You can swap the video for a new one (it keeps its spot in your Journey, and
                all its likes and views). Other apps make you delete everything and start from zero
                views. Zero doesn&apos;t.
              </p>
            </section>
          </Reveal>
          <Reveal delayMs={80}>
            <section className="h-full rounded-2xl border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] p-5">
              <h2 className="text-[1.15rem] font-bold tracking-tight text-ember">Before you upload</h2>
              <BulletList items={uploadTips} />
            </section>
          </Reveal>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonPrimary href="/">Explore Journeys</ButtonPrimary>
          <ButtonSecondary href="/dashboard">Create Your Journey</ButtonSecondary>
        </div>
      </main>
    </div>
  );
}
