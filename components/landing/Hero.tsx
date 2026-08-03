import Link from "next/link";
import { HeroBackgroundSlideshow } from "@/components/landing/HeroBackgroundSlideshow";
import { HeroUpdatesPanel } from "@/components/landing/HeroUpdatesPanel";
import { Logo } from "@/components/layout/Logo";
import { SplitReveal } from "@/components/common/SplitReveal";
import type { FollowedUpdate } from "@/lib/discovery/updates";

type HeroProps = {
  updates: FollowedUpdate[];
};

export function Hero({ updates }: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <HeroBackgroundSlideshow />
      <HeroUpdatesPanel updates={updates} />

      <div className="relative z-10 mx-auto flex min-h-[62vh] max-w-7xl flex-col justify-center px-6 py-16 lg:min-h-[70vh] lg:py-20">
        <div className="max-w-xl">
          <p className="animate-[fade-up_0.8s_ease-out_both] text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted">
            Every journey starts from
          </p>

          <div className="mt-4 animate-[logo-in_1.1s_ease-out_both] [animation-delay:100ms]">
            <Logo className="h-16 sm:h-20 lg:h-24" />
          </div>

          <p className="mt-6 max-w-md animate-[fade-up_0.8s_ease-out_both] text-lg font-semibold text-ink [animation-delay:520ms]">
            The platform for real people building real transformations.
          </p>

          <SplitReveal
            lines={[
              "Share your journey. Inspire others. Grow together.",
              "This isn't content: it's change.",
            ]}
            className="mt-3 max-w-md text-ink-muted"
            delay={0.7}
          />

          <div className="mt-8 flex flex-wrap gap-4 animate-[fade-up_0.8s_ease-out_both] [animation-delay:620ms]">
            <a
              href="#discover"
              className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-transform duration-150 after:absolute after:inset-0 after:scale-50 after:rounded-full after:bg-white/40 after:opacity-0 after:transition-all after:duration-500 hover:bg-ink-muted active:scale-95 active:after:scale-150 active:after:opacity-100"
            >
              <PlayIcon className="h-3 w-3" />
              Explore Journeys
            </a>
            <Link
              href="/register"
              className="relative overflow-hidden rounded-full border border-white/25 bg-black/20 px-6 py-3 text-sm font-semibold text-ink backdrop-blur-sm transition-transform duration-150 after:absolute after:inset-0 after:scale-50 after:rounded-full after:bg-white/30 after:opacity-0 after:transition-all after:duration-500 hover:border-white/50 active:scale-95 active:after:scale-150 active:after:opacity-100"
            >
              Create Your Journey
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-3 animate-[fade-up_0.8s_ease-out_both] [animation-delay:720ms]">
            <div className="flex -space-x-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-9 w-9 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm"
                />
              ))}
            </div>
            <p className="text-sm text-ink-muted">
              Join thousands of creators and millions of followers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2 1.5v9l8-4.5-8-4.5z" />
    </svg>
  );
}
