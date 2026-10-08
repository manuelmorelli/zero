"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { DESKTOP_QUERY, REDUCED_MOTION_QUERY } from "@/hooks/useRichMotion";

/** none = telefono/tablet (nessun video, resta la foto), still = fotogramma fermo per chi ha
 * chiesto meno movimento, play = video muto che scorre. Le clip sono in lib/discovery/heroVideos.ts. */
export type HeroVideoMode = "none" | "still" | "play";

function getHeroVideoMode(): HeroVideoMode {
  if (!window.matchMedia(DESKTOP_QUERY).matches) return "none";
  return window.matchMedia(REDUCED_MOTION_QUERY).matches ? "still" : "play";
}

function subscribe(onChange: () => void) {
  const lists = [DESKTOP_QUERY, REDUCED_MOTION_QUERY].map((query) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
}

export function useHeroVideoMode(): HeroVideoMode {
  return useSyncExternalStore(subscribe, getHeroVideoMode, () => "none");
}

type HeroBackgroundVideoProps = {
  clips: { src: string; poster: string }[];
  index: number;
  mode: Exclude<HeroVideoMode, "none">;
  muted: boolean;
  onEnded: () => void;
};

/** Le clip stanno una sopra l'altra: quella in corso è visibile, le altre aspettano già caricate,
 * così il passaggio da una all'altra è una dissolvenza e non un salto. */
export function HeroBackgroundVideo({ clips, index, mode, muted, onEnded }: HeroBackgroundVideoProps) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  // La clip in corso riparte dall'inizio, le altre restano ferme.
  useEffect(() => {
    refs.current.forEach((video, clipIndex) => {
      if (!video) return;
      if (clipIndex === index && mode === "play") {
        video.currentTime = 0;
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [index, mode]);

  // React non aggiorna l'attributo muted dopo il primo render: va impostato a mano. Solo la clip
  // in corso può avere l'audio.
  useEffect(() => {
    refs.current.forEach((video, clipIndex) => {
      if (video) video.muted = muted || clipIndex !== index;
    });
  }, [index, muted]);

  return clips.map((clip, clipIndex) => (
    <video
      key={clip.src}
      ref={(node) => {
        refs.current[clipIndex] = node;
      }}
      src={clip.src}
      poster={clip.poster}
      loop={clips.length === 1}
      muted
      playsInline
      preload={mode === "play" ? "auto" : "none"}
      onEnded={clipIndex === index ? onEnded : undefined}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
        clipIndex === index ? "opacity-100" : "opacity-0"
      }`}
    />
  ));
}
