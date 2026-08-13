"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, Quote } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { ButtonPrimary, ButtonSecondary } from "@/components/common/Button";
import { heroSlides } from "@/lib/demo/heroSlides";

const creators = ["Alex R.", "Sarah J.", "David L.", "Emma W.", "James T."];

export function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const slide = heroSlides[active] ?? heroSlides[0]!;

  return (
    <section className="relative overflow-hidden">
      {/* Foto cinematografica: a schermo intero su mobile, colonna destra su desktop */}
      <div className="absolute inset-0 md:left-[26%]">
        {heroSlides.map((item, index) => (
          <Image
            key={item.alt}
            src={item.image}
            alt={item.alt}
            fill
            sizes="100vw"
            preload={index === 0}
            className={`object-cover transition-opacity duration-1000 ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-bg/65 md:bg-bg/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg from-5% via-bg/70 to-transparent md:from-bg md:from-20% md:via-bg/45 md:via-55%" />
        <div className="absolute inset-y-0 left-0 hidden w-32 bg-gradient-to-r from-bg to-transparent md:block" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] gap-5 px-5 pt-10 pb-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] md:grid-rows-[auto_auto] md:gap-x-8 md:gap-y-3 md:px-8 md:pt-12 md:pb-3">
        <div className="max-w-lg md:col-start-1 md:row-start-1">
          <p className="text-[0.7rem] uppercase tracking-[0.42em] text-ink-muted">
            Every journey starts from
          </p>
          <h1 className="mt-2 bg-gradient-to-b from-white via-white to-white/45 bg-clip-text text-[18vw] leading-[0.82] font-black tracking-tight text-transparent sm:text-[6.5rem] lg:text-[8rem]">
            ZERO
          </h1>
          <p className="mt-3 max-w-[19ch] text-2xl leading-tight font-semibold text-balance sm:text-[1.5rem]">
            For real people <span className="text-ink-muted">building real transformations.</span>
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
            Share your journey. Inspire others. Grow together.
            <br />
            This is not content. This is change.
          </p>
        </div>

        {/* Bottoni + avatar — la citazione a destra si allinea a questa riga */}
        <div className="max-w-lg md:col-start-1 md:row-start-2">
          <div className="flex flex-wrap gap-3">
            <ButtonPrimary href="#discover">
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              Explore Journeys
            </ButtonPrimary>
            <ButtonSecondary href="/register">Create Your Journey</ButtonSecondary>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {creators.map((name) => (
                <Avatar
                  key={name}
                  name={name}
                  className="h-9 w-9 border-2 border-bg bg-surface-2 text-[0.65rem]"
                />
              ))}
            </div>
            <p className="text-xs leading-relaxed text-ink-muted">
              Join thousands of creators
              <br />
              and millions of followers
            </p>
          </div>
        </div>

        {/* Citazione sopra la foto, allineata alla riga dei bottoni */}
        <div className="relative flex md:col-start-2 md:row-start-2 md:justify-end md:self-start">
          <div className="w-full md:max-w-[22rem]">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <Quote className="h-3.5 w-3.5 text-ember" aria-hidden="true" />
              <p className="mt-2 text-xs leading-relaxed text-ink/90">{slide.quote}</p>
              <p className="mt-2 text-[0.65rem] text-ink-muted">&mdash; {slide.author}</p>
            </div>
            <div className="mt-2.5 flex items-center gap-2 md:justify-end">
              {heroSlides.map((item, index) => (
                <button
                  key={item.alt}
                  type="button"
                  aria-label={`Show journey ${index + 1}`}
                  onClick={() => setActive(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === active ? "w-7 bg-ember" : "w-1.5 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
