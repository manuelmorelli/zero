"use client";

import { useEffect, type RefObject } from "react";
import type { VideoPlayerHandle } from "@/components/common/VideoPlayer";
import { MUSIC_FADE_IN_SEC, MUSIC_FADE_OUT_SEC } from "@/lib/music/constants";

type EpisodeMusicProps = {
  /** Il player dell'episodio: la musica ne segue play, pausa, salti e volume. */
  playerRef: RefObject<VideoPlayerHandle | null>;
  trackId: string;
  /** 0-100 */
  volume: number;
  fade: boolean;
};

const SMOOTHING_SEC = 0.08;

/** Fa suonare il brano scelto dal creator insieme al video, senza toccare il file video.
 * Il brano si scarica da /api/music/[id] e gira in loop con Web Audio: il volume funziona anche
 * su iPhone (dove il volume di un normale tag audio è bloccato). Non disegna niente. */
export function EpisodeMusic({ playerRef, trackId, volume, fade }: EpisodeMusicProps) {
  useEffect(() => {
    const video = playerRef.current?.video;
    if (!video) return;
    const AudioContextClass =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const media = video;
    const ctx = new AudioContextClass();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    let buffer: AudioBuffer | null = null;
    let source: AudioBufferSourceNode | null = null;
    let cancelled = false;

    function stop() {
      if (!source) return;
      try {
        source.stop();
      } catch {
        // già fermo
      }
      source.disconnect();
      source = null;
    }

    function updateGain() {
      const base = (volume / 100) * (media.muted ? 0 : media.volume);
      let factor = 1;
      if (fade && media.duration > 0 && Number.isFinite(media.duration)) {
        const t = media.currentTime;
        factor = Math.max(0, Math.min(1, t / MUSIC_FADE_IN_SEC, (media.duration - t) / MUSIC_FADE_OUT_SEC));
      }
      gain.gain.setTargetAtTime(base * factor, ctx.currentTime, SMOOTHING_SEC);
    }

    function start() {
      if (!buffer || media.paused || media.ended) return;
      stop();
      void ctx.resume();
      source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start(0, media.currentTime % buffer.duration);
      updateGain();
    }

    fetch(`/api/music/${trackId}`)
      .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(new Error("music"))))
      .then((bytes) => ctx.decodeAudioData(bytes))
      .then((decoded) => {
        if (cancelled) return;
        buffer = decoded;
        start();
      })
      .catch(() => {
        // Senza musica il video funziona comunque, come prima.
      });

    media.addEventListener("playing", start);
    media.addEventListener("seeked", start);
    media.addEventListener("pause", stop);
    media.addEventListener("waiting", stop);
    media.addEventListener("seeking", stop);
    media.addEventListener("ended", stop);
    media.addEventListener("timeupdate", updateGain);
    media.addEventListener("volumechange", updateGain);

    return () => {
      cancelled = true;
      media.removeEventListener("playing", start);
      media.removeEventListener("seeked", start);
      media.removeEventListener("pause", stop);
      media.removeEventListener("waiting", stop);
      media.removeEventListener("seeking", stop);
      media.removeEventListener("ended", stop);
      media.removeEventListener("timeupdate", updateGain);
      media.removeEventListener("volumechange", updateGain);
      stop();
      void ctx.close();
    };
  }, [playerRef, trackId, volume, fade]);

  return null;
}
