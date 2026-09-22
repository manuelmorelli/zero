"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Maximize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { formatDuration as formatTime } from "@/lib/format/duration";

const SKIP_BACK_SEC = 15;

export type VideoPlayerHandle = {
  video: HTMLVideoElement | null;
};

type VideoPlayerProps = {
  posterUrl?: string | null;
  /** Percentuale (0-1) di riproduzione a cui avvisare il chiamante (es. per sbloccare Trusty o
   * segnare un episodio completato) tramite onThreshold. Facoltativo. */
  thresholdFraction?: number;
  onThreshold?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  /** Riceve l'elemento video direttamente dall'evento (non dal ref): chi lo usa può leggerne/
   * impostarne le proprietà (es. currentTime per riprendere da dove si era arrivati) senza dover
   * dereferenziare un ref dentro una callback, cosa che il linter di React non permette più. */
  onLoadedMetadata?: (video: HTMLVideoElement) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  /** Nasconde il tasto "indietro 15s" quando non ha senso (clip molto brevi). Presente per default,
   * stesso comportamento già in uso per gli episodi. */
  showSkipBack?: boolean;
  className?: string;
};

/**
 * Player video "di default" condiviso in tutto il sito: stessa dimensione (aspect naturale, fino
 * al 70% dell'altezza dello schermo, mai ritagliato) e stessa barra di controllo (play/pausa,
 * avanzamento, indietro 15s, volume, schermo intero) usata dagli episodi dei Journey
 * (components/journey/EpisodePlayer.tsx) e dalla vista ingrandita del video di presentazione
 * (components/profile/PresentationVideoCard.tsx) — stessi comandi ovunque nel sito, un solo posto
 * da aggiornare se cambiano. Non gestisce la sorgente del video (HLS/originale, progress saving,
 * Trusty, ecc.): quello resta responsabilità di chi lo usa, tramite il ref esposto.
 */
export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer(
  {
    posterUrl,
    thresholdFraction,
    onThreshold,
    onTimeUpdate,
    onLoadedMetadata,
    onPlay,
    onPause,
    onEnded,
    showSkipBack = true,
    className,
  },
  forwardedRef
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const thresholdReachedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useImperativeHandle(forwardedRef, () => ({ video: videoRef.current }), []);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === shellRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  return (
    <div
      ref={shellRef}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-black leading-[0] ${
        isFullscreen ? "flex h-full w-full items-center justify-center border-0" : "inline-block"
      } ${className ?? ""}`}
    >
      <video
        ref={videoRef}
        poster={posterUrl ?? undefined}
        playsInline
        preload="metadata"
        className={
          isFullscreen ? "block h-full w-full object-contain" : "block h-auto max-h-[70vh] w-auto max-w-full"
        }
        onClick={toggle}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          setTime(video.currentTime);
          onTimeUpdate?.(video.currentTime, video.duration);
          if (
            !thresholdReachedRef.current &&
            thresholdFraction !== undefined &&
            video.duration > 0 &&
            video.currentTime / video.duration >= thresholdFraction
          ) {
            thresholdReachedRef.current = true;
            onThreshold?.();
          }
        }}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          onLoadedMetadata?.(event.currentTarget);
        }}
        onPlay={() => {
          setPlaying(true);
          onPlay?.();
        }}
        onPause={() => {
          setPlaying(false);
          onPause?.();
        }}
        onEnded={() => {
          setPlaying(false);
          thresholdReachedRef.current = true;
          onEnded?.();
        }}
      />

      {!playing && (
        <button
          type="button"
          aria-label="Play video"
          onClick={toggle}
          className="absolute inset-0 grid place-items-center bg-bg/35 transition-opacity"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-bg/60 backdrop-blur-md transition-transform duration-300 hover:scale-105">
            <Play className="h-6 w-6 fill-current text-ember" aria-hidden="true" />
          </span>
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/85 to-transparent p-3 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
        <input
          type="range"
          aria-label="Seek"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(event) => {
            const next = Number(event.target.value);
            setTime(next);
            if (videoRef.current) videoRef.current.currentTime = next;
          }}
          className="h-1 w-full cursor-pointer accent-ember"
        />
        <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
          <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="text-ink">
            {playing ? (
              <Pause className="h-5 w-5 fill-current" aria-hidden="true" />
            ) : (
              <Play className="h-5 w-5 fill-current" aria-hidden="true" />
            )}
          </button>
          {showSkipBack && (
            <button
              type="button"
              aria-label={`Back ${SKIP_BACK_SEC} seconds`}
              onClick={() => {
                if (!videoRef.current) return;
                const next = Math.max(0, videoRef.current.currentTime - SKIP_BACK_SEC);
                videoRef.current.currentTime = next;
                setTime(next);
              }}
              className="text-ink"
            >
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
          <span className="tabular-nums">
            {formatTime(time)} / {formatTime(duration)}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={() => {
                const next = !muted;
                setMuted(next);
                if (videoRef.current) videoRef.current.muted = next;
              }}
              className="text-ink"
            >
              {muted ? <VolumeX className="h-5 w-5" aria-hidden="true" /> : <Volume2 className="h-5 w-5" aria-hidden="true" />}
            </button>
            <input
              type="range"
              aria-label="Volume"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(event) => {
                const next = Number(event.target.value);
                setVolume(next);
                setMuted(next === 0);
                if (videoRef.current) {
                  videoRef.current.volume = next;
                  videoRef.current.muted = next === 0;
                }
              }}
              className="h-1 w-20 cursor-pointer accent-ember"
            />
            <button
              type="button"
              aria-label="Fullscreen"
              onClick={() => {
                const el = shellRef.current;
                if (!el) return;
                if (document.fullscreenElement) void document.exitFullscreen();
                else void el.requestFullscreen();
              }}
              className="text-ink"
            >
              <Maximize className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
