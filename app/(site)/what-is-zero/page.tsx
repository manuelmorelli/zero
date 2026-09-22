import {
  BadgeCheck,
  Clock,
  Compass,
  Eye,
  Layers,
  ListOrdered,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { ButtonPrimary, ButtonSecondary } from "@/components/common/Button";
import { Reveal } from "@/components/common/Reveal";

export const metadata = {
  title: "What is Zero — Journeys told as they happen",
  description:
    "Zero is built around Journeys: real paths documented from the very first day. Reputation earned over time, ranked by Trust Score instead of likes.",
};

const paragraphs = [
  "There are stories we only ever meet at the end. We see someone who made it. We see the result. We see the house, the project, the body, the business, the success. But we almost never see the moment it all began. The doubt. The fear of not making it. The first attempt that failed. The decision to start again. The day no one was watching.",
  "Zero begins exactly there.",
  "Zero is a platform built around Journeys: real paths, told as they happen. We don't want to show you only where someone ended up. We want to let you see how they got there.",
  "On Zero you can meet a person at their starting point and decide to follow their path. You can see the attempts, the mistakes, the insights, the struggles, the small wins, and the decisions that change the direction of the story.",
  "A Journey isn't a collection of videos. It's a story that takes shape over time. It has a Presentation. It has Chapters. It has Episodes. It has a path. And you can step inside it.",
  "You can start today. Pause tomorrow. Come back in a week and pick up exactly where you left off. You can follow it all the way to the end.",
  "And maybe, while you watch someone else face their own road, something shifts in you too. Because maybe that person is doing today what you've been putting off for years.",
  "But Zero doesn't want to become another place where whoever gets the most likes wins. We don't believe millions of views necessarily mean value. We don't believe a number under a video can tell you how trustworthy a person is. And we don't want to build a platform where you have to shout louder than everyone else to be heard.",
  "On Zero, reputation is built over time. Trust is earned. Quality proves itself. A creator shouldn't be followed because an algorithm decided to make them famous. They should be followed because, episode after episode, they've shown they deserve that trust.",
  "That's why Zero looks past surface-level numbers. It looks at whether people start a Journey. Whether they continue it. Whether they finish it. Whether they come back. Whether they find value. Whether they choose to stay. Because someone who completes your Journey is telling you far more than a simple like: “I trusted you enough to make it to the end.”",
  "And that's the relationship we want to build. Not audience. Community. Not virality. Trust. Not disposable content. Journeys that stay.",
  "Zero wants to become the place where people can tell what they're building while they're building it. Where someone starting from zero can be seen. Where someone looking for a path can find one. Where one person's experience can become the map for someone else.",
  "Because every great story, before it became a success story, was simply a person who decided to start. And every Journey, before arriving somewhere, starts from Zero.",
];

const highlighted = new Set([
  "Zero begins exactly there.",
  "And that's the relationship we want to build. Not audience. Community. Not virality. Trust. Not disposable content. Journeys that stay.",
]);

type Bullet = { icon: LucideIcon; text: string };

const different: Bullet[] = [
  { icon: ListOrdered, text: "Episodes are watched in chronological order, from the very first one." },
  { icon: Layers, text: "Drag & drop reordering directly on your cards." },
  { icon: ShieldCheck, text: "Ranked by Trust Score, not likes." },
  { icon: Eye, text: "Every new Journey gets 15 days of guaranteed visibility to everyone." },
];

const howItWorks: Bullet[] = [
  { icon: Compass, text: "A Presentation, optional Chapters, and Episodes." },
  { icon: Clock, text: "Resume any episode exactly where you left off." },
  { icon: MousePointerClick, text: "Publishing takes two clicks, maximum." },
  {
    icon: BadgeCheck,
    text: "You can watch without an account — an account is only needed to follow, like, comment or save.",
  },
];

function BulletList({ items }: { items: Bullet[] }) {
  return (
    <ul className="mt-4 space-y-3">
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

export default function WhatIsZeroPage() {
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
            Every journey starts from
          </p>
          <h1 className="mt-2 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
            What is{" "}
            <span className="bg-gradient-to-br from-ember to-ember/50 bg-clip-text text-transparent">
              Zero
            </span>
          </h1>
        </Reveal>

        <div className="mt-5 space-y-3">
          {paragraphs.map((text) =>
            highlighted.has(text) ? (
              <p
                key={text.slice(0, 40)}
                className="rounded-2xl border border-ember/25 bg-gradient-to-r from-ember/12 to-transparent px-5 py-4 text-lg font-semibold leading-snug tracking-tight text-ember sm:text-xl"
              >
                {text}
              </p>
            ) : (
              <p key={text.slice(0, 40)} className="text-[0.95rem] leading-relaxed text-ink">
                {text}
              </p>
            )
          )}
          <p className="relative overflow-hidden rounded-2xl border border-ember/30 bg-gradient-to-br from-ember/15 via-ember/5 to-transparent px-6 py-6 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            Every Journey Starts From{" "}
            <span className="bg-gradient-to-br from-ember to-ember/50 bg-clip-text text-transparent">
              Zero.
            </span>
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Reveal>
            <section className="h-full rounded-2xl border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] p-5">
              <h2 className="text-base font-bold tracking-tight">What makes Zero different</h2>
              <BulletList items={different} />
            </section>
          </Reveal>
          <Reveal delayMs={80}>
            <section className="h-full rounded-2xl border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] p-5">
              <h2 className="text-base font-bold tracking-tight">How it works</h2>
              <BulletList items={howItWorks} />
            </section>
          </Reveal>
        </div>

        <Reveal>
          <p className="mt-5 text-sm text-ink">
            Curious how the algorithm actually decides what to show?{" "}
            <Link href="/how-it-works#algorithm" className="font-semibold text-ember hover:text-ember/80">
              Know the Algorithm. Know Zero.
            </Link>
          </p>
        </Reveal>

        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonPrimary href="/">Explore Journeys</ButtonPrimary>
          <ButtonSecondary href="/dashboard">Create Your Journey</ButtonSecondary>
        </div>
      </main>
    </div>
  );
}
