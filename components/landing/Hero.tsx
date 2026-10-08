"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Quote, Volume2, VolumeX } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ButtonPrimary, ButtonSecondary, IconButton } from "@/components/ui/button";
import { StoryViewer } from "@/components/home/StoryViewer";
import { HeroBackgroundVideo, useHeroVideoMode } from "@/components/landing/HeroBackgroundVideo";
import { HeroPayoff } from "@/components/landing/HeroPayoff";
import type { HeroSlide } from "@/lib/demo/heroSlides";
import type { HeroVideo } from "@/lib/discovery/heroVideos";
import type { CreatorStory } from "@/lib/discovery/stories";
import { HERO_PAYOFF_MS, HERO_PAYOFFS } from "@/lib/landing/heroPayoffs";
import { getGsapScrollTrigger, prefersLightMotion } from "@/lib/gsapClient";
import { PANEL_GLASS } from "@/components/ui/panel";
import { PAGE_WIDTH } from "@/components/ui/page-container";
import { cn } from "@/lib/utils";

const creators = ["Alex R.", "Sarah J.", "David L.", "Emma W.", "James T."];

/** Su telefono (niente video) foto e card cambiano insieme, con un ritmo proprio e più lento
 * delle frasi: la card non segue mai le frasi. */
const HERO_SLIDE_MS = 10000;

type HeroProps = {
  /** Foto a rotazione: Journey reali con più punteggio quando ce ne sono, altrimenti le 4 foto
   * demo (vedi lib/discovery/heroJourneys.ts e lib/demo/heroSlides.ts). */
  slides: HeroSlide[];
  /** Clip della Hero da computer, ognuna legata al suo episodio (vedi lib/discovery/heroVideos.ts). */
  videos: HeroVideo[];
  /** Updates dei creator seguiti: solo per chi ha fatto il sign in (vuoto per gli ospiti). */
  stories: CreatorStory[];
  /** Il proprio Update attivo, se si ha un profilo Creator: null per chi non ne ha uno (mai
   * mostrato) o per gli ospiti. A differenza di `stories`, non si segue mai se stessi, quindi
   * senza questo prop il proprio Update non comparirebbe mai nella propria Home. */
  ownStory: CreatorStory | null;
};

export function Hero({ slides, videos, stories, ownStory }: HeroProps) {
  const [active, setActive] = useState(0);
  const [openStoryIndex, setOpenStoryIndex] = useState<number | null>(null);
  const [ownStoryOpen, setOwnStoryOpen] = useState(false);
  const [payoffIndex, setPayoffIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoMode = useHeroVideoMode();
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Frasi e foto hanno due ritmi separati (docs/21_Motion_Guidelines.md). Chi ha chiesto meno
  // movimento non ha cambi automatici: resta sulla frase di Zero e sulla prima card.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const payoffTimer = window.setInterval(() => setPayoffIndex((prev) => (prev + 1) % HERO_PAYOFFS.length), HERO_PAYOFF_MS);
    const slideTimer = window.setInterval(() => setActive((prev) => (prev + 1) % slides.length), HERO_SLIDE_MS);
    return () => {
      window.clearInterval(payoffTimer);
      window.clearInterval(slideTimer);
    };
  }, [slides.length]);

  // Racconto con lo scroll, solo da computer: mentre la pagina scorre (senza bloccarla) la foto o
  // il video si allontanano rimpicciolendosi e il testo sale più in fretta, sopra di loro.
  useEffect(() => {
    if (prefersLightMotion()) return;
    const { gsap } = getGsapScrollTrigger();
    const ctx = gsap.context(() => {
      const scrollTrigger = { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(mediaRef.current, { scale: 0.85, ease: "none", scrollTrigger });
      gsap.to(contentRef.current, { yPercent: -25, ease: "none", scrollTrigger });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const slide = slides[active] ?? slides[0]!;
  // Da computer la card segue il video: cambia quando cambia la clip, con le parole del creator.
  const video = videoMode !== "none" ? (videos[videoIndex] ?? null) : null;

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Foto cinematografica: come oggi angoli vivi/piena larghezza su mobile, come una card
       * (angoli arrotondati + margine laterale) da desktop in su, stile Netflix — stessa altezza
       * di prima, cambia solo la forma del contenitore. Da desktop in su la sezione è spostata in
       * basso di md:mt-12 (~altezza dell'header) così la card inizia subito sotto l'header invece
       * di iniziare dietro di lui: su mobile l'header resta sovrapposto come oggi. Da computer la
       * clip della Hero copre le foto (che restano sotto come riserva). */}
      <div ref={mediaRef} className="absolute inset-0 md:inset-x-[4.43%] md:overflow-hidden md:rounded-2xl">
        {slides.map((item, index) => (
          <Image
            key={item.alt}
            src={item.image}
            alt={item.alt}
            fill
            sizes="100vw"
            preload={index === 0}
            className={`animate-[kenburns_14s_ease-in-out_infinite_alternate] object-cover transition-opacity duration-1000 ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {video && videoMode !== "none" && (
          <HeroBackgroundVideo
            clips={videos}
            index={videoIndex}
            mode={videoMode}
            muted={muted}
            onEnded={() => setVideoIndex((prev) => (prev + 1) % videos.length)}
          />
        )}
        {/* Trattamento cinematografico: grana pellicola sulla foto e veli scuri per leggere il
         * testo a sinistra (classi hero-* in app/globals.css). */}
        <div className="hero-grain absolute inset-0" aria-hidden="true" />

        <div className="hero-scrim absolute inset-0" />
        <div className="hero-side-fade absolute inset-0" />
        <div className="cover-fade absolute inset-x-0 bottom-0 h-80" />
        {/* Audio della clip, in alto a destra: parte sempre muta, si attiva solo con un clic. */}
        {video && videoMode === "play" && (
          <IconButton
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            onClick={() => setMuted((prev) => !prev)}
            className="absolute top-4 right-4"
          >
            {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
          </IconButton>
        )}
      </div>

      {/* Margine laterale allineato alla foto rientrata della Hero (md:inset-x-[4.43%]). */}
      <div
        ref={contentRef}
        className={cn(
          PAGE_WIDTH.wideCover,
          "pointer-events-none relative grid gap-5 pt-16 pb-12 *:pointer-events-auto md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] md:grid-rows-[auto_auto_auto] md:gap-x-8 md:gap-y-3 md:pt-6 md:pb-12"
        )}
      >
        <div className="max-w-lg md:col-start-1 md:row-start-1">
          <p className="text-hero-eyebrow uppercase tracking-[0.42em] text-ink-muted">
            Every <span className="text-ember">journey</span> starts from
          </p>
          <Image
            src="/images/zero-wordmark.png"
            alt="Zero"
            width={3000}
            height={795}
            unoptimized
            className="mt-1 w-72 origin-left scale-x-95 sm:w-80 lg:w-96"
          />
          <HeroPayoff
            index={payoffIndex}
            className="mt-[0.675rem] max-w-[26ch] text-hero-headline leading-tight font-semibold text-balance"
          />
          <p className="mt-2 max-w-sm text-hero-subhead leading-relaxed text-ink-muted">
            Every journey has a beginning, every step has a story, and every story can inspire
            someone to start their own.
          </p>
        </div>

        {/* Bottoni: riga propria, sopra gli Update, non più condivisa con la card a destra. */}
        <div className="max-w-lg md:col-start-1 md:row-start-2">
          <div className="flex flex-wrap gap-3">
            <ButtonPrimary href="#discover">
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              Explore Journeys
            </ButtonPrimary>
            <ButtonSecondary href="/register">Create Your Journey</ButtonSecondary>
          </div>
        </div>

        {/* Avatar/Updates — la card del Journey (o citazione) a destra si allinea a questa riga. */}
        <div className="max-w-lg md:col-start-1 md:row-start-3">
          {ownStory || stories.length > 0 ? (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {ownStory && (
                <button
                  type="button"
                  onClick={() => ownStory.updates.length > 0 && setOwnStoryOpen(true)}
                  className="flex shrink-0 flex-col items-center gap-1.5"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full p-[2px] ${
                      ownStory.hasUnseen ? "bg-ember" : "bg-border"
                    }`}
                  >
                    <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-bg bg-surface-2 text-sm font-semibold text-ink-muted">
                      {ownStory.creatorAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ownStory.creatorAvatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        ownStory.creatorName.charAt(0).toUpperCase()
                      )}
                    </span>
                  </span>
                  <span className="max-w-11 truncate text-hero-caption text-ink-muted">You</span>
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
                      story.hasUnseen ? "bg-ember" : "bg-border"
                    }`}
                  >
                    <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-bg bg-surface-2 text-sm font-semibold text-ink-muted">
                      {story.creatorAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={story.creatorAvatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        story.creatorName.charAt(0).toUpperCase()
                      )}
                    </span>
                  </span>
                  <span className="max-w-11 truncate text-hero-caption text-ink-muted">
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
                  <span className="text-hero-caption text-ink-muted">View All</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {creators.map((name) => (
                  <Avatar
                    key={name}
                    name={name}
                    size="sm"
                    className="h-9 w-9 border-2 border-bg"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">
                No account needed to watch.
                <br />
                Join when you&apos;re ready to be part of it.
              </p>
            </div>
          )}
        </div>

        {/* Card sopra la foto, allineata alla riga degli Update: Journey reale se disponibile
         * (cliccabile, porta alla sua pagina), altrimenti la citazione demo. */}
        <div className="relative flex md:col-start-2 md:row-start-3 md:justify-end md:self-start">
          <div className="w-full md:max-w-[22rem]">
            {video ? <HeroVideoCard video={video} /> : <HeroSlideCard slide={slide} />}
            <div className="mt-2.5 flex items-center gap-2 md:justify-end">
              {video
                ? videos.length > 1 &&
                  videos.map((item, index) => (
                    <HeroDot key={item.src} label={`Show video ${index + 1}`} current={index === videoIndex} onClick={() => setVideoIndex(index)} />
                  ))
                : slides.map((item, index) => (
                    <HeroDot key={item.alt} label={`Show journey ${index + 1}`} current={index === active} onClick={() => setActive(index)} />
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

function HeroDot({ label, current, onClick }: { label: string; current: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`h-1.5 rounded-full transition-all duration-500 ${current ? "w-7 bg-ember" : "w-1.5 bg-ink-faint hover:bg-ink-muted"}`}
    />
  );
}

/** Card del video in corso: quello che il creator ha scritto sull'episodio da cui viene la clip
 * (categoria del Journey, titolo e didascalia dell'episodio), cliccabile verso l'episodio. */
function HeroVideoCard({ video }: { video: HeroVideo }) {
  return (
    <Link
      href={`/journeys/${video.journeyId}/episodes/${video.episodeId}`}
      className={cn(PANEL_GLASS, "block rounded-xl p-3.5 shadow-glow transition-colors duration-300 hover:border-ember")}
    >
      {video.category && <p className="text-hero-tag uppercase tracking-[0.2em] text-ember">{video.category}</p>}
      <p className="mt-1.5 text-sm leading-snug font-semibold text-ink">{video.episodeTitle}</p>
      {video.caption && <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink-muted">{video.caption}</p>}
      <p className="mt-1.5 text-hero-caption text-ink-muted">by {video.creatorName}</p>
    </Link>
  );
}

/** Contenuto testuale sopra la foto in Hero: un vero Journey (cliccabile) quando disponibile,
 * altrimenti la citazione demo di fallback (vedi lib/demo/heroSlides.ts). */
function HeroSlideCard({ slide }: { slide: HeroSlide }) {
  if (slide.kind === "demo") {
    return (
      <div className={cn(PANEL_GLASS, "rounded-xl p-3.5 shadow-glow")}>
        <Quote className="h-3.5 w-3.5 text-ember" aria-hidden="true" />
        <p className="mt-2 text-sm leading-relaxed text-ink">{slide.quote}</p>
        <p className="mt-2 text-hero-caption text-ink-muted">{slide.author}</p>
      </div>
    );
  }

  return (
    <Link
      href={`/journeys/${slide.id}`}
      className={cn(PANEL_GLASS, "block rounded-xl p-3.5 shadow-glow transition-colors duration-300 hover:border-ember")}
    >
      {slide.category && (
        <p className="text-hero-tag uppercase tracking-[0.2em] text-ember">{slide.category}</p>
      )}
      <p className="mt-1.5 text-sm leading-snug font-semibold text-ink">{slide.title}</p>
      <p className="mt-1.5 text-hero-caption text-ink-muted">by {slide.creatorName}</p>
    </Link>
  );
}
