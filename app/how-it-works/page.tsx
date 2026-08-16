import { Header } from "@/components/layout/Header";
import { Reveal } from "@/components/common/Reveal";

export const metadata = {
  title: "How it works — Zero",
  description:
    "Three steps to get started on Zero, plus answers to the questions people ask most.",
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

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <Header />
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-24 md:px-8 md:pt-28">
        <Reveal>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">How it works</h1>
          <p className="mt-3 text-ink-muted">
            Three steps to get started, plus the questions people ask most.
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
      </main>
    </div>
  );
}
