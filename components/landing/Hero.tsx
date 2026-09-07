"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Quote } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { ButtonPrimary, ButtonSecondary } from "@/components/common/Button";
import { StoryViewer } from "@/components/home/StoryViewer";
import type { HeroSlide } from "@/lib/demo/heroSlides";
import type { CreatorStory } from "@/lib/discovery/stories";

const creators = ["Alex R.", "Sarah J.", "David L.", "Emma W.", "James T."];

type HeroProps = {
  /** Foto a rotazione: Journey reali con più punteggio quando ce ne sono, altrimenti le 4 foto
   * demo (vedi lib/discovery/heroJourneys.ts e lib/demo/heroSlides.ts). */
  slides: HeroSlide[];
  /** Updates dei creator seguiti: solo per chi ha fatto il sign in (vuoto per gli ospiti). */
  stories: CreatorStory[];
  /** Il proprio Update attivo, se si ha un profilo Creator: null per chi non ne ha uno (mai
   * mostrato) o per gli ospiti. A differenza di `stories`, non si segue mai se stessi, quindi
   * senza questo prop il proprio Update non comparirebbe mai nella propria Home. */
  ownStory: CreatorStory | null;
};

export function Hero({ slides, stories, ownStory }: HeroProps) {
  const [active, setActive] = useState(0);
  const [openStoryIndex, setOpenStoryIndex] = useState<number | null>(null);
  const [ownStoryOpen, setOwnStoryOpen] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const slide = slides[active] ?? slides[0]!;

  return (
    <section className="relative overflow-hidden">
      {/* Foto cinematografica: a schermo intero su mobile, colonna destra su desktop */}
      <div className="absolute inset-0">
        {slides.map((item, index) => (
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
        <div className="absolute inset-0 bg-bg/65 md:bg-bg/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg from-5% via-bg/70 to-transparent md:from-bg/55 md:from-10% md:via-bg/20 md:via-45%" />
        <div className="absolute inset-y-0 left-0 hidden w-32 bg-gradient-to-r from-bg/40 to-transparent md:block" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] gap-5 px-5 pt-16 pb-12 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] md:grid-rows-[auto_auto] md:gap-x-8 md:gap-y-3 md:px-8 md:pt-[70px] md:pb-12">
        <div className="max-w-lg md:col-start-1 md:row-start-1">
          <p className="text-[0.7rem] uppercase tracking-[0.42em] text-ink-muted">
            Every <span className="text-ember">journey</span> starts from
          </p>
          <Image
            src="/images/zero-wordmark.png"
            alt="ZERO"
            width={3000}
            height={795}
            unoptimized
            className="mt-1 w-72 origin-left scale-x-95 sm:w-80 lg:w-96"
          />
          <p className="mt-3 max-w-[19ch] text-2xl leading-tight font-semibold text-balance sm:text-[1.5rem]">
            Because the destination is only part of{" "}
            <span className="text-ember">the story.</span>
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
            Every journey has a beginning, every step has a story, and every story can inspire
            someone to start their own.
          </p>
        </div>

        {/* Bottoni + avatar/Updates — la citazione a destra si allinea a questa riga */}
        <div className="max-w-lg md:col-start-1 md:row-start-2">
          <div className="flex flex-wrap gap-3">
            <ButtonPrimary href="#discover">
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              Explore Journeys
            </ButtonPrimary>
            <ButtonSecondary href="/register">Create Your Journey</ButtonSecondary>
          </div>

          {ownStory || stories.length > 0 ? (
            <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
              {ownStory && (
                <button
                  type="button"
                  onClick={() => ownStory.updates.length > 0 && setOwnStoryOpen(true)}
                  className="flex shrink-0 flex-col items-center gap-1.5"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full p-[2px] ${
                      ownStory.hasUnseen ? "bg-gradient-to-br from-ember to-danger" : "bg-border"
                    }`}
                  >
                    <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-bg bg-surface-2 text-xs font-semibold text-ink-muted">
                      {ownStory.creatorAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ownStory.creatorAvatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        ownStory.creatorName.charAt(0).toUpperCase()
                      )}
                    </span>
                  </span>
                  <span className="max-w-11 truncate text-[0.65rem] text-ink-muted">You</span>
                </button>
              )}
              {stories.slice(0, 6).map((story, index) => (
                <button
                  key={story.creatorId}
                  type="button"
                  onClick={() => setOpenStoryIndex(index)}
                  className="flex shrink-0 flex-col items-center gap-1.5"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full p-[2px] ${
                      story.hasUnseen ? "bg-gradient-to-br from-ember to-danger" : "bg-border"
                    }`}
                  >
                    <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-bg bg-surface-2 text-xs font-semibold text-ink-muted">
                      {story.creatorAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={story.creatorAvatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        story.creatorName.charAt(0).toUpperCase()
                      )}
                    </span>
                  </span>
                  <span className="max-w-11 truncate text-[0.65rem] text-ink-muted">
                    {story.creatorName}
                  </span>
                </button>
              ))}
              {stories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOpenStoryIndex(0)}
                  className="flex shrink-0 flex-col items-center gap-1.5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-2 text-ink-muted transition-colors hover:text-ember">
                    &rarr;
                  </span>
                  <span className="text-[0.65rem] text-ink-muted">View all</span>
                </button>
              )}
            </div>
          ) : (
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
                No account needed to watch.
                <br />
                Join when you&apos;re ready to be part of it.
              </p>
            </div>
          )}
        </div>

        {/* Card sopra la foto, allineata alla riga dei bottoni: Journey reale se disponibile
         * (cliccabile, porta alla sua pagina), altrimenti la citazione demo. */}
        <div className="relative flex md:col-start-2 md:row-start-2 md:justify-end md:self-start">
          <div className="w-full md:max-w-[22rem]">
            <HeroSlideCard slide={slide} />
            <div className="mt-2.5 flex items-center gap-2 md:justify-end">
              {slides.map((item, index) => (
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

      {openStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialCreatorIndex={openStoryIndex}
          isOwner={false}
          onClose={() => setOpenStoryIndex(null)}
        />
      )}

      {ownStoryOpen && ownStory && (
        <StoryViewer
          stories={[ownStory]}
          initialCreatorIndex={0}
          isOwner
          onClose={() => setOwnStoryOpen(false)}
        />
      )}
    </section>
  );
}

/** Contenuto testuale sopra la foto in Hero: un vero Journey (cliccabile) quando disponibile,
 * altrimenti la citazione demo di fallback (vedi lib/demo/heroSlides.ts). */
function HeroSlideCard({ slide }: { slide: HeroSlide }) {
  if (slide.kind === "demo") {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
        <Quote className="h-3.5 w-3.5 text-ember" aria-hidden="true" />
        <p className="mt-2 text-xs leading-relaxed text-ink/90">{slide.quote}</p>
        <p className="mt-2 text-[0.65rem] text-ink-muted">&mdash; {slide.author}</p>
      </div>
    );
  }

  return (
    <Link
      href={`/journeys/${slide.id}`}
      className="block rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-colors hover:border-ember/40"
    >
      {slide.category && (
        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-ember">{slide.category}</p>
      )}
      <p className="mt-1.5 text-sm leading-snug font-semibold text-ink">{slide.title}</p>
      <p className="mt-1.5 text-[0.65rem] text-ink-muted">by {slide.creatorName}</p>
    </Link>
  );
}
