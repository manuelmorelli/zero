"use client";

import { useEffect, useRef } from "react";
import { saveEpisodeProgress } from "@/lib/actions/progress";

// Sotto questa quota non vale la pena riprendere da dove si era arrivati (praticamente l'inizio).
const RESUME_THRESHOLD_SEC = 5;
// Un episodio è considerato completato oltre questa percentuale della durata, non solo a fine
// video esatto: evita che un buffering finale o un secondo mancante impediscano di segnarlo.
const COMPLETION_FRACTION = 0.95;
const SAVE_INTERVAL_MS = 15_000;

type EpisodeVideoPlayerProps = {
  episodeId: string;
  src: string;
  initialPositionSec?: number;
  initialCompleted?: boolean;
};

export function EpisodeVideoPlayer({
  episodeId,
  src,
  initialPositionSec = 0,
  initialCompleted = false,
}: EpisodeVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(initialCompleted);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const save = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!completedRef.current && video.duration > 0 && video.currentTime / video.duration >= COMPLETION_FRACTION) {
      completedRef.current = true;
    }
    saveEpisodeProgress(episodeId, video.currentTime, completedRef.current);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    // Salvataggio "best-effort" quando l'utente cambia pagina o chiude la scheda: può perdere gli
    // ultimissimi secondi (accettabile), ma copre il caso non coperto dal salvataggio periodico.
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") save();
    }
  }, [episodeId]);

  return (
    <video
      ref={videoRef}
      controls
      preload="metadata"
      src={src}
      className="mt-3 w-full rounded-lg bg-ink"
      onLoadedMetadata={() => {
        const video = videoRef.current;
        if (!video) return;
        if (
          !completedRef.current &&
          initialPositionSec >= RESUME_THRESHOLD_SEC &&
          initialPositionSec < video.duration - RESUME_THRESHOLD_SEC
        ) {
          video.currentTime = initialPositionSec;
        }
      }}
      onPlay={() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(save, SAVE_INTERVAL_MS);
      }}
      onPause={() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        save();
      }}
      onEnded={() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        completedRef.current = true;
        save();
      }}
    />
  );
}
