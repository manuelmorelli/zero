"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoPlayerHandle } from "@/components/common/VideoPlayer";
import { TOTAL_TRAILER_SECONDS } from "@/lib/constants/moments";

export type TrailerMoment = { timestampSec: number; description?: string | null };

/**
 * Il "trailer" di un singolo episodio: invece di guardare il video dal secondo 0 in avanti senza
 * interruzioni, salta da un momento migliore della Mappa dei Momenti al successivo (lib/ai/episodeMoments.ts,
 * EpisodeMoment.isHighlight). La durata TOTALE è sempre TOTAL_TRAILER_SECONDS, uguale per ogni
 * episodio: ogni momento dura quel totale diviso quanti punti ci sono, così chi ne segna di più non
 * resta in video più a lungo di chi ne segna pochi. Arrivato all'ultimo momento ricomincia dal
 * primo: non si ferma da solo, l'unico comando è play/pausa. Il ref del player è creato qui dentro
 * (non ricevuto da fuori) così resta l'unico punto che lo tocca.
 */
export function useMomentsTrailer(videoSrc: string, moments: TrailerMoment[]) {
  const playerRef = useRef<VideoPlayerHandle>(null);
  const sorted = [...moments].sort((a, b) => a.timestampSec - b.timestampSec);
  const clipSeconds = sorted.length > 0 ? TOTAL_TRAILER_SECONDS / sorted.length : 0;

  const [playing, setPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const video = playerRef.current?.video;
    if (video) video.src = videoSrc;
  }, [videoSrc]);

  function jumpTo(index: number) {
    const video = playerRef.current?.video;
    const moment = sorted[index];
    if (!video || !moment) return;
    // Mutazione imperativa intenzionale dell'elemento <video> tramite ref, non dello stato React:
    // lo stesso pattern già in uso in EpisodePlayer/PresentationVideoCard per pilotare il player.
    // eslint-disable-next-line react-hooks/immutability
    video.currentTime = moment.timestampSec;
    setActiveIndex(index);
  }

  function toggle() {
    const video = playerRef.current?.video;
    if (!video || sorted.length === 0) return;
    if (playing) {
      video.pause();
      setPlaying(false);
      return;
    }
    // Il primo "play" parte dal primo momento; un "play" dopo una pausa riprende da dove si era.
    if (!startedRef.current) {
      startedRef.current = true;
      jumpTo(0);
    }
    void video.play();
    setPlaying(true);
  }

  useEffect(() => {
    const video = playerRef.current?.video;
    if (!video || !playing) return;

    function handleTimeUpdate() {
      const moment = sorted[activeIndex];
      if (!video || !moment) return;
      if (video.currentTime >= moment.timestampSec + clipSeconds) {
        jumpTo((activeIndex + 1) % sorted.length);
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, activeIndex, sorted.length]);

  return { playerRef, playing, toggle, currentMoment: sorted[activeIndex] ?? null };
}
