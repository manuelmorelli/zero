"use client";

import Link from "next/link";
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { saveEpisodeProgress } from "@/lib/actions/progress";
import { formatDuration as formatTime } from "@/lib/format/duration";
import { Avatar } from "@/components/common/Avatar";
import { TrustScoreBadge } from "@/components/common/TrustScoreBadge";
import { LikeButton } from "@/components/journey/LikeButton";
import { ShareButton } from "@/components/common/ShareButton";

// Sotto questa quota non vale la pena riprendere da dove si era arrivati (praticamente l'inizio).
const RESUME_THRESHOLD_SEC = 5;
// Un episodio è considerato completato oltre questa percentuale della durata, non solo a fine
// video esatto: evita che un buffering finale o un secondo mancante impediscano di segnarlo.
const COMPLETION_FRACTION = 0.95;
const SAVE_INTERVAL_MS = 15_000;

type EpisodePlayerProps = {
  journeyId: string;
  journeyTitle: string;
  journeyCategory: string | null;
  creator: { userId: string; displayName: string };
  trustScore: number;
  episode: {
    id: string;
    title: string;
    caption: string | null;
    number: number;
    videoSrc: string | null;
    // URL del manifest HLS su Cloudflare Stream, valorizzato solo quando la versione leggera è
    // pronta (Episode.lightVideoStatus === "READY", vedi lib/stream.ts) — video ottimizzati per
    // connessioni lente. Quando presente, il player la usa al posto dell'originale: la qualità si
    // adatta da sola in tempo reale alla connessione di chi guarda, invece di una singola qualità
    // fissa per tutti. L'originale (videoSrc) resta sempre il fallback finché non è pronta.
    lightVideoSrc: string | null;
    posterUrl: string | null;
  };
  initialPositionSec: number;
  initialCompleted: boolean;
  initialLikeCount: number;
  initialIsLiked: boolean;
  isLoggedIn: boolean;
  isOwnContent: boolean;
};

export function EpisodePlayer({
  journeyId,
  journeyTitle,
  journeyCategory,
  creator,
  trustScore,
  episode,
  initialPositionSec,
  initialCompleted,
  initialLikeCount,
  initialIsLiked,
  isLoggedIn,
  isOwnContent,
}: EpisodePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(initialCompleted);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === shellRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const save = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!completedRef.current && video.duration > 0 && video.currentTime / video.duration >= COMPLETION_FRACTION) {
      completedRef.current = true;
    }
    void saveEpisodeProgress(episode.id, video.currentTime, completedRef.current);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Sceglie la sorgente video: quella leggera (streaming adattivo) se pronta, altrimenti
  // l'originale. Impostata via ref invece che con l'attributo JSX `src` perché la versione leggera
  // è HLS — Safari la riproduce nativamente, gli altri browser hanno bisogno di hls.js (nessun
  // browser supporta HLS via il semplice attributo `src`, tranne Safari).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (episode.lightVideoSrc) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = episode.lightVideoSrc;
      } else if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(episode.lightVideoSrc);
        hls.attachMedia(video);
      } else {
        video.src = episode.videoSrc ?? "";
      }
    } else {
      video.src = episode.videoSrc ?? "";
    }

    return () => {
      hls?.destroy();
    };
  }, [episode.id, episode.videoSrc, episode.lightVideoSrc]);

  useEffect(() => {
    // Salvataggio "best-effort" quando l'utente cambia pagina o chiude la scheda: può perdere gli
    // ultimissimi secondi (accettabile), ma copre il caso non coperto dal salvataggio periodico.
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") save();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode.id]);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="min-w-0">
      <div className={episode.videoSrc && !isFullscreen ? "flex justify-center" : ""}>
        <div
          ref={shellRef}
          className={`group relative overflow-hidden border-border bg-black ${
            isFullscreen
              ? "flex h-full w-full items-center justify-center border-0"
              : episode.videoSrc
                ? "inline-block rounded-2xl border leading-[0]"
                : "aspect-video w-full rounded-2xl border"
          }`}
        >
        {episode.videoSrc ? (
          <video
            ref={videoRef}
            poster={episode.posterUrl ?? undefined}
            playsInline
            preload="metadata"
            className={
              isFullscreen
                ? "block h-full w-full object-contain"
                : "block h-auto max-h-[70vh] w-auto max-w-full"
            }
            onClick={toggle}
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration);
              const video = event.currentTarget;
              if (
                !completedRef.current &&
                initialPositionSec >= RESUME_THRESHOLD_SEC &&
                initialPositionSec < video.duration - RESUME_THRESHOLD_SEC
              ) {
                video.currentTime = initialPositionSec;
                setTime(initialPositionSec);
              }
            }}
            onPlay={() => {
              setPlaying(true);
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = setInterval(save, SAVE_INTERVAL_MS);
            }}
            onPause={() => {
              setPlaying(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = null;
              save();
            }}
            onEnded={() => {
              setPlaying(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = null;
              completedRef.current = true;
              save();
            }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-ink-muted">
            No video for this episode yet.
          </div>
        )}

        {episode.videoSrc && !playing && (
          <button
            type="button"
            aria-label="Play episode"
            onClick={toggle}
            className="absolute inset-0 grid place-items-center bg-bg/35 transition-opacity"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-bg/60 backdrop-blur-md transition-transform duration-300 hover:scale-105">
              <Play className="h-6 w-6 fill-current" aria-hidden="true" />
            </span>
          </button>
        )}

        {episode.videoSrc && (
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
                  <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                )}
              </button>
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
                  {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
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
                  <Maximize className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[0.6rem] tracking-[0.22em] text-ink-muted uppercase">
          Episode {episode.number}
          {journeyCategory ? ` · ${journeyCategory}` : ""}
        </p>
        <h1 className="mt-1.5 text-xl font-bold leading-tight tracking-tight md:text-2xl">
          {episode.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          <Link href={`/journeys/${journeyId}`} className="transition-colors hover:text-ember">
            {journeyTitle}
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href={`/profile/${creator.userId}`}
            className="flex min-w-0 items-center gap-2 transition-colors hover:text-ember"
          >
            <Avatar name={creator.displayName} className="h-7 w-7 text-[0.65rem]" />
            <span className="truncate">{creator.displayName}</span>
          </Link>
          <TrustScoreBadge score={trustScore} />
          <div className="ml-auto flex items-center gap-4">
            <LikeButton
              targetType="EPISODE"
              targetId={episode.id}
              initialLikeCount={initialLikeCount}
              initialIsLiked={initialIsLiked}
              isLoggedIn={isLoggedIn}
            />
            <ShareButton
              path={`/journeys/${journeyId}/episodes/${episode.id}`}
              label={episode.title}
              updateCaption={
                isOwnContent
                  ? `New episode: ${episode.title}`
                  : `Check out this episode by ${creator.displayName}: ${episode.title}`
              }
              linkedEpisodeId={episode.id}
              className="text-ink-muted transition-colors hover:text-ember"
            />
          </div>
        </div>
        {episode.caption && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-ink-muted">{episode.caption}</p>
        )}
      </div>
    </div>
  );
}
