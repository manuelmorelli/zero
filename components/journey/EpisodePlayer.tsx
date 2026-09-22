"use client";

import Link from "next/link";
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { saveEpisodeProgress } from "@/lib/actions/progress";
import { Avatar } from "@/components/common/Avatar";
import { TrustScoreBadge } from "@/components/common/TrustScoreBadge";
import { TrustyButton } from "@/components/journey/TrustyButton";
import { ShareButton } from "@/components/common/ShareButton";
import { VideoPlayer, type VideoPlayerHandle } from "@/components/common/VideoPlayer";

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
  trustScore: number | null;
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
  const playerRef = useRef<VideoPlayerHandle>(null);
  const completedRef = useRef(initialCompleted);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Trusty si sblocca solo a fine visione (stessa soglia usata per segnare l'episodio completato,
  // COMPLETION_FRACTION), non da subito come il vecchio like — resta sbloccato anche se poi si
  // torna indietro nel video.
  const [trustyUnlocked, setTrustyUnlocked] = useState(initialCompleted);

  const save = () => {
    const video = playerRef.current?.video;
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
    const video = playerRef.current?.video;
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

  return (
    <div className="min-w-0">
      <div className={episode.videoSrc ? "flex justify-center" : ""}>
        <div className="grid gap-4">
          {episode.videoSrc ? (
            <VideoPlayer
              ref={playerRef}
              posterUrl={episode.posterUrl}
              thresholdFraction={COMPLETION_FRACTION}
              onThreshold={() => setTrustyUnlocked(true)}
              onLoadedMetadata={(video) => {
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
                setTrustyUnlocked(true);
                save();
              }}
            />
          ) : (
            <div className="grid aspect-video w-full place-items-center rounded-2xl border border-border bg-black text-sm text-ink-muted">
              No video for this episode yet.
            </div>
          )}

          <div className="relative">
            <div className="absolute right-0 top-0 flex items-center gap-1.5 scale-125 origin-top-right">
              <TrustyButton
                targetType="EPISODE"
                targetId={episode.id}
                initialLikeCount={initialLikeCount}
                initialIsLiked={initialIsLiked}
                isLoggedIn={isLoggedIn}
                unlocked={trustyUnlocked}
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
                className="text-ember transition-opacity hover:opacity-80"
              />
            </div>
            <p className="pr-24 text-[0.66rem] leading-none tracking-[0.22em] text-ember uppercase">
              Episode {episode.number}
              {journeyCategory ? ` · ${journeyCategory}` : ""}
            </p>
            <h1 className="mt-1 text-xl font-bold leading-tight tracking-tight md:text-2xl">
              {episode.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <Link href={`/journeys/${journeyId}`} className="transition-colors hover:text-ember">
                {journeyTitle}
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href={`/profile/${creator.userId}`}
                className="flex min-w-0 items-center gap-1.5 transition-colors hover:text-ember"
              >
                <Avatar name={creator.displayName} className="h-6 w-6 text-[0.6rem]" />
                <span className="truncate">{creator.displayName}</span>
              </Link>
              {trustScore !== null && <TrustScoreBadge score={trustScore} />}
            </div>
            {episode.caption && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-ember">{episode.caption}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
