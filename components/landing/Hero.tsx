"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Quote, Volume2, VolumeX } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CreatorProfileLink } from "@/components/journey/CreatorProfileLink";
import { ButtonSecondary, IconButton } from "@/components/ui/button";
import { StoryViewer } from "@/components/home/StoryViewer";
import { HeroBackgroundVideo, useHeroVideoMode } from "@/components/landing/HeroBackgroundVideo";
import { HeroPayoff } from "@/components/landing/HeroPayoff";
import { FadeImage } from "@/components/common/FadeImage";
import type { HeroSlide } from "@/lib/demo/heroSlides";
import type { HeroVideo } from "@/lib/discovery/heroVideos";
import type { CreatorStory } from "@/lib/discovery/stories";
import { HERO_PAYOFF_MS, HERO_PAYOFFS } from "@/lib/landing/heroPayoffs";
import { getGsapScrollTrigger, prefersLightMotion } from "@/lib/gsapClient";
import { PANEL_GLASS } from "@/components/ui/panel";
import { CoverChip, CoverTitle } from "@/components/ui/cover-card";
import { CardTitle } from "@/components/ui/heading";
import { PAGE_WIDTH } from "@/components/ui/page-container";
import { cn } from "@/lib/utils";
import { COVER_IMAGE_QUALITY } from "@/lib/constants/image";

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

  // Riga di Update (storie): usata sia dentro la Hero da desktop in su, sia come riga a sé sotto
  // la Hero su mobile (dove la Hero stessa mostra solo foto + card, vedi sopra) — stesso contenuto,
  // definita qui per condividere lo stato (setOpenStoryIndex/setOwnStoryOpen) senza passarlo a mano.
  function StoriesRow() {
    return ownStory || stories.length > 0 ? (
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {ownStory && (
          <button
            type="button"
            onClick={() => ownStory.updates.length > 0 && setOwnStoryOpen(true)}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <span
              className={`flex h-19 w-19 items-center justify-center rounded-full p-[2px] md:h-11 md:w-11 ${
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
            <span className="max-w-11 truncate text-hero-caption text-on-photo-muted max-md:max-w-19 max-md:text-base">You</span>
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
              className={`flex h-19 w-19 items-center justify-center rounded-full p-[2px] md:h-11 md:w-11 ${
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
            <span className="max-w-11 truncate text-hero-caption text-on-photo-muted max-md:max-w-19 max-md:text-base">
              {story.creatorName}
            </span>
          </button>
        ))}
      </div>
    ) : (
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2.5">
          {creators.map((name) => (
            <Avatar key={name} name={name} size="sm" className="h-9 w-9 border-2 border-bg" />
          ))}
        </div>
        <p className="text-sm leading-relaxed text-on-photo-muted">
          No account needed to watch.
          <br />
          Join when you&apos;re ready to be part of it.
        </p>
      </div>
    );
  }

  return (
    <>
    <section ref={sectionRef} className="relative overflow-hidden md:overflow-visible">
      {/* Luce ambiente, solo da computer (stile Ambient Mode di YouTube): dietro a tutta la Hero
       * una copia sfocata della foto in evidenza (classe hero-ambient in app/globals.css), una per
       * slide, sovrapposte: si accende solo quella attiva con una dissolvenza, come le foto nitide
       * più sotto. Quando c'è il video la luce usa il poster della clip attiva (non un secondo
       * video, troppo pesante) e cambia insieme alla clip. Sopra: il velo scuro a sinistra per
       * leggere scritta/frase/pulsanti anche su foto chiare, e in basso la sfumatura verso il
       * colore della pagina (cover-fade) così non c'è una riga netta prima delle card. Vive fuori
       * da mediaRef/contentRef apposta: il racconto con lo scroll non la tocca. Su telefono non
       * esiste (hidden), la Hero mobile resta com'è. Sale fin sotto il bordo alto dello schermo
       * (top negativo = lo spazio lasciato all'header dal contenitore in app/(site)/page.tsx,
       * stesso valore), così la luce si vede anche attraverso il vetro della barra in alto: per
       * questo da computer la sezione non taglia più ciò che sporge (overflow visibile), e a
       * tagliare la copia ingrandita ci pensa questo contenitore. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden overflow-hidden md:top-[calc(-3.85rem-1cm)] md:block"
        aria-hidden="true"
      >
        {slides.map((item, index) => (
          <HeroAmbientLight key={item.alt} src={item.image} on={!video && index === active} />
        ))}
        {videos.map((item, index) => (
          <HeroAmbientLight key={item.src} src={item.poster} on={!!video && index === videoIndex} />
        ))}
        <div className="hero-side-fade absolute inset-0" />
        <div className="cover-fade absolute inset-x-0 bottom-0 h-80" />
      </div>

      {/* Foto cinematografica: su mobile un blocco alto a sé (stile Netflix, solo foto + card del
       * Journey in evidenza sopra, niente scritta ZERO/frase/pulsanti/storie qui — quelli restano
       * solo da desktop in su, vedi contentRef più sotto; la scritta ZERO vive ora più grande
       * nell'header, components/layout/Header.tsx). Da desktop in su resta come prima: angoli
       * arrotondati + margine laterale, altezza che segue il contenuto a fianco (position
       * absolute). Da computer la clip della Hero copre le foto (che restano sotto come riserva). */}
      <div
        ref={mediaRef}
        className="relative mt-5 aspect-[4/3] overflow-hidden rounded-xl shadow-card md:absolute md:inset-x-0 md:top-0 md:mx-auto md:mt-0 md:translate-x-50 md:translate-y-7 md:w-[min(calc(100vw_-_340px_-_5.25rem),calc(1060px_-_5.25rem),calc(70vh*16/9))] md:h-[min(calc((100vw_-_340px_-_5.25rem)*9/16),calc((1060px_-_5.25rem)*9/16),70vh)] md:aspect-auto md:rounded-2xl md:shadow-none"
      >
        {/* Solo la foto/video e i veli scuri sono dentro questo involucro con la maschera: la
         * pillola col messaggio e i pallini più sotto NON ci stanno dentro apposta, altrimenti la
         * maschera sbiadiva anche loro (bug trovato da Manuel, 2026-10-30). */}
        <div className="hero-mobile-fade absolute inset-0">
          {slides.map((item, index) => (
            <FadeImage
              key={item.alt}
              src={item.image}
              alt={item.alt}
              fill
              sizes="100vw"
              quality={COVER_IMAGE_QUALITY}
              preload={index === 0}
              className={`animate-[kenburns_14s_ease-in-out_infinite_alternate] object-cover transition-opacity duration-1000 ${
                // Spente del tutto quando c'è un video (non solo "sotto" di lui): se il video avesse
                // mai un vuoto momentaneo durante il cambio clip, sotto non deve comparire la foto di
                // un altro Journey che non c'entra, meglio restasse nero.
                video ? "opacity-0" : index === active ? "opacity-100" : "opacity-0"
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
          {/* Trattamento cinematografico da desktop in su: grana pellicola e veli scuri per leggere
           * il testo a sinistra (classi hero-* in app/globals.css). Su mobile solo una sfumatura in
           * basso (card-scrim, la stessa di ogni card con foto del sito) per leggere la card sopra,
           * la foto resta visibile. */}
          <div className="hero-grain absolute inset-0 hidden md:block" aria-hidden="true" />
          <div className="hero-scrim absolute inset-0 hidden md:block" />
          <div className="hero-side-fade absolute inset-0 hidden md:block" />
          {/* Sfumatura verso il colore di sfondo della pagina, per eliminare la riga netta dove la
           * foto finisce e comincia il resto della pagina (Manuel, 2026-10-29). Dipinta per ultima
           * (sopra card-scrim) così è lei a decidere il colore proprio sul bordo finale. */}
          <div className="cover-fade absolute inset-x-0 bottom-0 hidden h-48 md:block md:h-80" />
        </div>
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

        {/* Card del Journey in evidenza, solo su mobile: titolo/autore/categoria in alto a
         * sinistra + pulsante Watch, didascalia + pallini in basso al centro. Da desktop in su
         * questa stessa informazione vive nella card a destra più sotto (HeroCard). */}
        <div className="absolute inset-0 flex flex-col justify-between px-4 pt-4 pb-0 md:hidden">
          <MobileHeroInfo slide={slide} />
          <div className="flex flex-col items-center">
            <MobileHeroCaption slide={slide} />
          </div>
        </div>

        {/* Blocco titolo in alto a sinistra sulla foto, solo da computer: stesso formato
         * (categoria + titolo) delle card Journey/episodio altrove nel sito (JourneyCard.tsx).
         * Solo per guardare, non è un link: quello vive già nella pillola più sotto (HeroCard). */}
        <div className="absolute left-4 top-4 hidden md:block">
          <DesktopHeroTitle slide={slide} video={video} />
        </div>
      </div>

      {/* Margine laterale della pagina (PAGE_WIDTH.wideCover): scritta ZERO, frase, pulsanti e
       * storie, solo da desktop in su (vedi nota sopra). La foto/video sopra è rientrata di più
       * (stessa larghezza del player episodio: colonna video della pagina episodio, mai più di 70vh×16/9, Manuel 2026-11-11). */}
      <div
        ref={contentRef}
        className={cn(
          PAGE_WIDTH.wideCover,
          "pointer-events-none relative hidden gap-5 pt-16 pb-12 *:pointer-events-auto md:grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] md:grid-rows-[auto_auto_auto] md:gap-x-8 md:gap-y-3 md:pt-6 md:pb-12"
        )}
      >
        <div className="max-w-lg md:col-start-1 md:row-start-1">
          <p className="text-hero-eyebrow uppercase tracking-[0.42em] text-on-photo-muted">
            Every <span className="text-ember">journey</span> starts from
          </p>
          <Image
            src="/images/zero-wordmark.svg"
            alt="Zero"
            width={597}
            height={173}
            unoptimized
            className="mt-1 w-72 sm:w-80 lg:w-96"
          />
          <HeroPayoff
            index={payoffIndex}
            className="mt-[0.675rem] max-w-[26ch] text-hero-headline leading-tight font-semibold text-balance text-on-photo"
          />
          <p className="mt-2 max-w-sm text-hero-subhead leading-relaxed text-on-photo-muted">
            Every journey has a beginning, every step has a story, and every story can inspire
            someone to start their own.
          </p>
        </div>

        {/* Bottoni: riga propria, sopra gli Update, non più condivisa con la card a destra. */}
        <div className="max-w-lg md:col-start-1 md:row-start-2">
          <div className="flex flex-wrap gap-3">
            <ButtonSecondary href="#discover" className="!text-on-photo">
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              Explore Journeys
            </ButtonSecondary>
            <ButtonSecondary href="/register" className="!text-on-photo">Create Your Journey</ButtonSecondary>
          </div>
        </div>

        {/* Avatar/Updates — la card del Journey (o citazione) a destra si allinea a questa riga. */}
        <div className="max-w-lg md:col-start-1 md:row-start-3">
          {StoriesRow()}
        </div>

        {/* Card sopra la foto, allineata alla riga degli Update: Journey reale se disponibile
         * (cliccabile, porta alla sua pagina), altrimenti la citazione demo. */}
        <div className="relative flex md:col-start-2 md:row-start-3 md:justify-end md:self-start md:translate-y-5 md:-translate-x-5">
          <div className="w-full md:max-w-[14rem]">
            {video ? (
              <HeroCard
                kind="content"
                href={`/journeys/${video.journeyId}/episodes/${video.episodeId}`}
                title={video.episodeTitle}
                creatorName={video.creatorName}
                caption={video.caption}
              />
            ) : slide.kind === "demo" ? (
              <HeroCard kind="demo" quote={slide.quote} author={slide.author} />
            ) : (
              <HeroCard
                kind="content"
                href={`/journeys/${slide.id}`}
                title={slide.title}
                creatorName={slide.creatorName}
              />
            )}
            <div className="mt-2.5 flex items-center gap-2 md:justify-center">
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
      {/* Storie, solo su mobile: sopra vivono dentro la Hero (da desktop in su), qui sotto perché
       * la Hero mobile mostra solo foto + card del Journey (vedi sopra). */}
      <div className={cn(PAGE_WIDTH.wideCover, "pt-2 md:hidden")}>
        {/* Pallini del Journey in evidenza: fuori dalla foto (che taglierebbe ciò che esce dal bordo),
         * nello spazio libero sotto, allineati a destra come la pillola del messaggio. */}
        <div className="flex items-center justify-end gap-2 pr-3">
          {slides.map((item, index) => (
            <HeroDot key={item.alt} label={`Show journey ${index + 1}`} current={index === active} onClick={() => setActive(index)} />
          ))}
        </div>
        <div className="mt-4">{StoriesRow()}</div>
      </div>
    </>
  );
}

/** Una copia sfocata di una foto della Hero, per la luce ambiente (vedi la nota nella sezione).
 * La dissolvenza (stessa durata delle foto nitide) sta sul contenitore, la sfocatura e
 * l'opacità fissa della luce sulla classe hero-ambient dentro: così le due opacità non si
 * pestano i piedi. Immagine piccola (sizes): sfocata a 70px il dettaglio non si vede comunque. */
function HeroAmbientLight({ src, on }: { src: string; on: boolean }) {
  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ${on ? "opacity-100" : "opacity-0"}`}>
      <div className="hero-ambient absolute inset-0">
        <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
      </div>
    </div>
  );
}

function HeroDot({ label, current, onClick }: { label: string; current: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="group p-2 -m-2 max-md:p-3 max-md:-m-3">
      <span
        className={`block h-1.5 rounded-full transition-all duration-500 group-hover:scale-125 ${current ? "w-7 bg-ember max-md:w-9" : "w-1.5 bg-overlay group-hover:bg-on-photo-muted max-md:w-2"} max-md:h-2`}
      />
    </button>
  );
}

/** In alto a sinistra sulla foto, solo su mobile: titolo, autore + numero episodi, categoria,
 * pulsante Watch — tutto ciò che la Hero mobile mostra di un Journey (vedi la nota su mediaRef più
 * sopra). Niente per la citazione demo: senza un Journey vero non c'è nulla da guardare. */
function MobileHeroInfo({ slide }: { slide: HeroSlide }) {
  // Un div vuoto (non null): deve restare comunque il primo dei due elementi flex del contenitore
  // sopra (justify-between), altrimenti con un solo figlio la pillola in basso sale in cima
  // invece di restare in fondo.
  if (slide.kind === "demo") return <div aria-hidden="true" />;

  return (
    <div className="relative -top-2 -left-2 max-w-[78%]">
      <Link href={`/journeys/${slide.id}`} className="block">
        {slide.category && <CoverChip className="px-1.5 py-0 text-hero-mobile-tag">{slide.category}</CoverChip>}
        <CardTitle as="h2" className="relative top-1 -mt-2 truncate !text-on-photo text-hero-mobile-title leading-[1.35] font-extrabold">{slide.title}</CardTitle>
        <p className="-mt-1 truncate text-hero-mobile-meta text-on-photo">by {slide.creatorName}</p>
      </Link>
      <ButtonSecondary
        href={`/journeys/${slide.id}`}
        className="!border-ember-line !bg-ember-ash backdrop-saturate-50 mt-1 gap-1 px-3 py-0 text-sm !text-on-photo"
      >
        Watch
        <Play className="h-[15px] w-[15px] fill-current" aria-hidden="true" />
      </ButtonSecondary>
    </div>
  );
}

/** Blocco categoria + titolo in alto a sinistra sulla foto, solo da computer. Niente per la
 * citazione demo: senza un Journey vero non c'è un titolo da mostrare. */
function DesktopHeroTitle({ slide, video }: { slide: HeroSlide; video: HeroVideo | null }) {
  const category = video ? video.category : slide.kind === "journey" ? slide.category : null;
  const title = video ? video.episodeTitle : slide.kind === "journey" ? slide.title : null;
  const creatorName = video ? video.creatorName : slide.kind === "journey" ? slide.creatorName : null;
  const creatorAvatarUrl = video ? video.creatorAvatarUrl : slide.kind === "journey" ? slide.creatorAvatarUrl : null;
  const creatorUserId = video ? video.creatorUserId : slide.kind === "journey" ? slide.creatorUserId : undefined;
  if (!title) return null;

  return (
    <div className="max-w-xs">
      {category && <CoverChip className="mb-1">{category}</CoverChip>}
      <CoverTitle>{title}</CoverTitle>
      {creatorName && (
        <CreatorProfileLink userId={creatorUserId} className="mt-1.5 flex items-center gap-1.5">
          <Avatar name={creatorName} avatarUrl={creatorAvatarUrl} size="xs" />
          <span className="truncate text-sm text-on-photo-muted">{creatorName}</span>
        </CreatorProfileLink>
      )}
    </div>
  );
}

/** Pillola in basso a destra dentro la foto, a filo col bordo, solo su mobile: solo la didascalia (la descrizione del
 * Journey, o la citazione demo di fallback) — mai categoria/titolo, già mostrati sopra. */
function MobileHeroCaption({ slide }: { slide: HeroSlide }) {
  const text = slide.kind === "demo" ? slide.quote : slide.description;
  if (!text) return null;

  return (
    <div className={cn(PANEL_GLASS, "max-w-[300px] self-end rounded-full px-6 py-1.5 text-center shadow-glow")}>
      <p className="truncate text-sm leading-[1.3] font-semibold text-on-photo">{text}</p>
    </div>
  );
}

/** Card testuale sopra la foto in Hero: unica per ogni contenuto possibile (clip video in corso,
 * Journey reale senza video, o citazione demo di fallback senza Journey — vedi lib/demo/heroSlides.ts
 * e lib/discovery/heroVideos.ts). Titolo, didascalia e creator ciascuno sulla propria riga. */
function HeroCard(
  props:
    | { kind: "demo"; quote: string; author: string }
    | { kind: "content"; href: string; title: string; creatorName: string; caption?: string | null }
) {
  if (props.kind === "demo") {
    return (
      <div className={cn(PANEL_GLASS, "rounded-[2rem] p-2.5 shadow-glow")}>
        <Quote className="h-3.5 w-3.5 text-ember" aria-hidden="true" />
        <p className="mt-2 text-sm leading-relaxed text-on-photo">{props.quote}</p>
        <p className="mt-2 text-hero-caption text-on-photo-muted">{props.author}</p>
      </div>
    );
  }

  return (
    <Link
      href={props.href}
      className={cn(PANEL_GLASS, "block rounded-[2rem] px-2.5 py-0 shadow-glow transition-colors duration-300 hover:border-ember")}
    >
      <p className="mt-1.5 truncate pl-2 text-sm leading-snug font-semibold text-on-photo">{props.title}</p>
      {props.caption && <p className="mt-1 line-clamp-2 pl-2 text-sm leading-snug text-on-photo-muted">{props.caption}</p>}
      <p className="mt-1.5 text-center text-hero-caption text-on-photo-muted">by {props.creatorName}</p>
    </Link>
  );
}
