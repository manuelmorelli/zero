"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { getGsapScrollTrigger, prefersLightMotion } from "@/lib/gsapClient";

type NetflixRowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  viewAllHref: string;
  children: React.ReactNode;
};

/** Riga scorrevole orizzontalmente stile Netflix, con leggero effetto di profondità legato allo scroll. */
export function NetflixRow({ icon, title, subtitle, viewAllHref, children }: NetflixRowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || prefersLightMotion()) return;

    const { gsap, ScrollTrigger } = getGsapScrollTrigger();
    gsap.set(section, { opacity: 0, scale: 0.9 });

    const tween = gsap.to(section, {
      opacity: 1,
      scale: 1,
      ease: "power1.out",
      scrollTrigger: {
        trigger: section,
        start: "top 98%",
        end: "top 45%",
        scrub: true,
      },
    });

    // Ogni card entra con un leggero zoom + passaggio da sfocata a nitida, non legata
    // allo scroll orizzontale della riga ma alla prima volta che la riga entra in viewport.
    const cards = track ? (Array.from(track.children) as HTMLElement[]) : [];
    let batchTriggers: ReturnType<typeof ScrollTrigger.batch> = [];
    if (cards.length > 0) {
      gsap.set(cards, { opacity: 0, scale: 0.85, filter: "blur(14px)" });
      batchTriggers = ScrollTrigger.batch(cards, {
        start: "top 95%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "power2.out",
            stagger: 0.1,
            // Rilascia gli stili inline a fine animazione: le card usano già hover/scale via
            // classi Tailwind (es. hover:-translate-y-1), che uno stile inline residuo bloccherebbe.
            clearProps: "transform,filter,opacity",
          }),
      });
    }

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      batchTriggers.forEach((trigger) => trigger.kill());
      ScrollTrigger.refresh();
    };
  }, []);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <section ref={sectionRef} className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-1 text-ink-muted">{icon}</span>
            <div>
              <h2 className="font-sans text-2xl font-extrabold tracking-tight">{title}</h2>
              <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
            </div>
          </div>
          <Link
            href={viewAllHref}
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-ink-muted transition-colors hover:text-ink sm:flex"
          >
            View all →
          </Link>
        </div>

        <div className="relative">
          <div
            ref={trackRef}
            className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2"
            style={{ scrollSnapType: "x proximity" }}
          >
            {children}
          </div>

          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Scroll right"
            className="absolute -right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-ink backdrop-blur-sm transition-colors hover:border-white/40 md:flex"
          >
            <ArrowIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M7.5 4.5l5.5 5.5-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
