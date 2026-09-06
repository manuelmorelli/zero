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
    a: "Yes. Create a creator profile and publish your first Journey — in the first version you can have one active Journey at a time.",
  },
  {
    q: "Is my data safe?",
    a: "Yes, payments go through Stripe only and your data is never shared with third parties without your consent.",
  },
];

const uploadTips = [
  "Export as MP4 — it works everywhere and keeps quality high.",
  "Upload your original file, not a copy you already posted somewhere else — every re-upload loses a little quality.",
  "Keep your original resolution (1080p or higher) — Zero never compresses your video, so what you upload is exactly what people see.",
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-24 md:px-8 md:pt-28">
        <Reveal>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Know the Algorithm. Know Zero.
          </h1>
          <p className="mt-3 text-ink-muted">
            Three steps to get started, the questions people ask most, and how everything really works.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.number} delayMs={index * 120}>
              <span className="text-sm font-bold text-ink-faint">{step.number}</span>
              <h2 className="mt-3 text-lg font-bold">{step.title}</h2>
              <p className="mt-2 text-ink-muted">{step.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={100}>
          <h2 className="mb-6 mt-16 text-2xl font-bold tracking-tight sm:text-3xl">
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

        <Reveal delayMs={100}>
          <h2
            id="algorithm"
            className="mb-4 mt-16 scroll-mt-24 text-2xl font-bold tracking-tight sm:text-3xl"
          >
            How the algorithm decides what to show
          </h2>
        </Reveal>
        <Reveal delayMs={140}>
          <div className="space-y-4 text-ink-muted">
            <p>
              The algorithm doesn&apos;t care how many followers you have. It cares about one thing: do
              people actually stick around and come back?
            </p>
            <p>
              If people finish your episodes and come back for the next one, more people get to see
              you. Followers help a little, but only up to a point — after that, having more
              doesn&apos;t push you higher.
            </p>
            <p>
              The only way your score goes down is if people report you and we confirm something was
              actually wrong. Never because you&apos;re small.
            </p>
          </div>
        </Reveal>
        <Reveal delayMs={180}>
          <p className="mt-5 rounded-2xl border border-ember/25 bg-gradient-to-r from-ember/12 to-transparent px-5 py-4 text-sm font-medium leading-relaxed text-ink">
            A creator with 5 followers, where everyone finishes every episode, is shown to more people
            than a creator with 600 followers that nobody finishes.
          </p>
        </Reveal>

        <Reveal delayMs={100}>
          <h2 className="mb-4 mt-16 text-2xl font-bold tracking-tight sm:text-3xl">
            Publishing isn&apos;t the end
          </h2>
        </Reveal>
        <Reveal delayMs={140}>
          <p className="text-ink-muted">
            On Zero, publishing an episode isn&apos;t final. Found a mistake, or want to make it
            better? You can swap the video for a new one — it keeps its spot in your Journey, and all
            its likes and views. Other apps make you delete everything and start from zero views. Zero
            doesn&apos;t.
          </p>
        </Reveal>

        <Reveal delayMs={100}>
          <h2 className="mb-4 mt-16 text-2xl font-bold tracking-tight sm:text-3xl">Before you upload</h2>
        </Reveal>
        <Reveal delayMs={140}>
          <ul className="space-y-3 text-ink-muted">
            {uploadTips.map((tip) => (
              <li key={tip.slice(0, 24)} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ember/30 bg-ember/10 text-xs font-bold text-ember">
                  ✓
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </main>
    </div>
  );
}
