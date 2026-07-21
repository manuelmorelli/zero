import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { UpdatesPanel } from "@/components/landing/UpdatesPanel";
import { HeroBackgroundSlideshow } from "@/components/landing/HeroBackgroundSlideshow";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <HeroBackgroundSlideshow />

      <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl flex-col px-6 py-16 lg:min-h-[92vh] lg:py-20">
        <div className="flex flex-1 flex-col justify-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="max-w-xl">
            <p className="animate-[fade-up_0.8s_ease-out_both] text-xs font-semibold uppercase tracking-[0.25em] text-ink-muted">
              Every journey starts from
            </p>
            <h1 className="mt-4 animate-[fade-up_0.8s_ease-out_both] [animation-delay:100ms]">
              <Logo className="h-14 sm:h-16 lg:h-20" />
            </h1>
            <p className="mt-6 max-w-md animate-[fade-up_0.8s_ease-out_both] text-lg font-semibold text-ink [animation-delay:220ms]">
              The platform for real people building real transformations.
            </p>
            <p className="mt-3 max-w-md animate-[fade-up_0.8s_ease-out_both] text-ink-muted [animation-delay:320ms]">
              Share your journey. Inspire others. Grow together. This
              isn&apos;t content: it&apos;s change.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 animate-[fade-up_0.8s_ease-out_both] [animation-delay:420ms]">
              <Link
                href="/register"
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
              >
                Start Your Journey →
              </Link>
              <a
                href="#journey"
                className="rounded-full border border-white/25 bg-black/20 px-6 py-3 text-sm font-semibold text-ink backdrop-blur-sm transition-colors hover:border-white/50"
              >
                Explore Journeys
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3 animate-[fade-up_0.8s_ease-out_both] [animation-delay:520ms]">
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

          <div className="w-full max-w-sm animate-[fade-up_0.9s_ease-out_both] lg:shrink-0 [animation-delay:280ms]">
            <UpdatesPanel />
          </div>
        </div>

        <div className="animate-[fade-up_0.8s_ease-out_both] [animation-delay:620ms]">
          <JourneyScrubber />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* JOURNEY SCRUBBER — firma visiva: "ogni Journey parte da 00:00"     */
/* ------------------------------------------------------------------ */

function JourneyScrubber() {
  return (
    <div className="mt-10 flex items-center gap-4 lg:mt-16">
      <span className="font-mono text-[11px] tracking-widest text-ember tabular-nums">
        00:00
      </span>
      <div className="relative h-px flex-1 bg-white/15">
        <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-ember shadow-[0_0_12px_2px_rgba(226,145,77,0.6)]" />
      </div>
      <span className="hidden text-[11px] uppercase tracking-widest text-ink-faint sm:block">
        Your story begins here
      </span>
    </div>
  );
}
