"use client";

import Link from "next/link";
import Hls from "hls.js";
import { MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { saveEpisodeProgress } from "@/lib/actions/progress";
import { Avatar } from "@/components/ui/avatar";
import { TrustScoreBadge } from "@/components/common/TrustScoreBadge";
import type { CreatorTrust } from "@/lib/profile/trustScore";
import { TrustyButton } from "@/components/journey/TrustyButton";
import { HighlightMarkButton } from "@/components/journey/HighlightMarkButton";
import { HighlightList } from "@/components/journey/HighlightList";
import { ShareButton } from "@/components/common/ShareButton";
import { VideoPlayer, type VideoPlayerHandle } from "@/components/common/VideoPlayer";
import { PageTitle } from "@/components/ui/heading";
import { SponsoredLabel } from "@/components/common/SponsoredLabel";
import { useHighlightMarker } from "@/hooks/useHighlightMarker";
import {
  AUTOPLAY_STORAGE_KEY,
  NextEpisodeOverlay,
  type NextEpisodeInfo,
} from "@/components/journey/NextEpisodeOverlay";

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
  creator: { userId: string; displayName: string; avatarUrl: string | null };
  trust: CreatorTrust;
  episode: {
    id: string;
    title: string;
    caption: string | null;
    isSponsored: boolean;
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
  /** Punti già segnati a mano dal creator (stellina), vuoto per chi non è il creator. */
  manualHighlights: { id: string; timestampSec: number }[];
  /** Episodio che segue questo nel Journey; null se questo è l'ultimo. */
  nextEpisode: NextEpisodeInfo | null;
};

export function EpisodePlayer({
  journeyId,
  journeyTitle,
  journeyCategory,
  creator,
  trust,
  episode,
  initialPositionSec,
  initialCompleted,
  initialLikeCount,
  initialIsLiked,
  isLoggedIn,
  isOwnContent,
  manualHighlights,
  nextEpisode,
}: EpisodePlayerProps) {
  const playerRef = useRef<VideoPlayerHandle>(null);
  const completedRef = useRef(initialCompleted);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Trusty si sblocca solo a fine visione (stessa soglia usata per segnare l'episodio completato,
  // COMPLETION_FRACTION), non da subito come il vecchio like — resta sbloccato anche se poi si
  // torna indietro nel video.
  const [trustyUnlocked, setTrustyUnlocked] = useState(initialCompleted);
  const [ended, setEnded] = useState(false);
  const { highlights, isPending: isMarkingPending, mark, remove, full } = useHighlightMarker(episode.id, manualHighlights);

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

  // Se l'episodio precedente ha lasciato il segnale "parti da solo" (conto alla rovescia finito o
  // "Play now"), lo consuma e avvia il video. Il browser può rifiutare l'avvio automatico: in quel
  // caso resta il pulsante play grande, senza errori.
  // Il segnale si cancella solo quando il video parte davvero (onPlay): in sviluppo React esegue
  // gli effetti due volte e ricarica la sorgente, il che interromperebbe un play() lanciato troppo
  // presto. Si aspetta quindi che il video sia pronto (canplay) prima di avviarlo.
  useEffect(() => {
    const video = playerRef.current?.video;
    if (!video) return;
    let shouldAutoplay = false;
    try {
      shouldAutoplay = sessionStorage.getItem(AUTOPLAY_STORAGE_KEY) === episode.id;
    } catch {
      return;
    }
    if (!shouldAutoplay) return;

    const start = () => video.play().catch(() => {});
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      start();
      return;
    }
    video.addEventListener("canplay", start, { once: true });
    return () => video.removeEventListener("canplay", start);
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
              overlay={
                ended ? (
                  <NextEpisodeOverlay
                    journeyId={journeyId}
                    next={nextEpisode}
                    onWatchAgain={() => playerRef.current?.restart()}
                  />
                ) : undefined
              }
              extraControl={
                isOwnContent ? (
                  <HighlightMarkButton
                    count={highlights.length}
                    full={full}
                    disabled={isMarkingPending}
                    onMark={() => mark(playerRef.current?.video?.currentTime ?? 0)}
                  />
                ) : undefined
              }
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
                setEnded(false);
                try {
                  sessionStorage.removeItem(AUTOPLAY_STORAGE_KEY);
                } catch {
                  // Nessun problema: il segnale serve solo per l'avvio automatico.
                }
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
                setEnded(true);
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
                isOwnContent={isOwnContent}
              />
              {/* Forum del Journey a un clic dal video, accanto a Trusty (richiesto da Manuel). */}
              <Link
                href={`/community/forum/${journeyId}`}
                aria-label="Open the Journey forum"
                title="Forum"
                className="grid h-7 w-7 place-items-center text-ember transition-opacity hover:opacity-80"
              >
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
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
            <div className="flex flex-wrap items-center justify-between gap-2 pr-32 md:pr-48">
              <p className="text-sm leading-none tracking-[0.22em] text-ember uppercase">
                {journeyTitle} ·
                Episode {episode.number}
                {journeyCategory ? ` · ${journeyCategory}` : ""}
              </p>
              {isOwnContent && <HighlightList highlights={highlights} onRemove={remove} />}
            </div>
            <PageTitle className="mt-1">
              {episode.title}
            </PageTitle>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              <Link
                href={`/profile/${creator.userId}`}
                className="flex min-w-0 items-center gap-1.5 transition-colors hover:text-ember"
              >
                <Avatar name={creator.displayName} avatarUrl={creator.avatarUrl} size="sm" />
                <span className="truncate">{creator.displayName}</span>
              </Link>
              <span aria-hidden="true">·</span>
              <Link href={`/journeys/${journeyId}`} className="transition-colors hover:text-ember">
                {journeyTitle}
              </Link>
              {trust.score !== null && <TrustScoreBadge score={trust.score} trustedByCount={trust.trustedByCount} />}
              {episode.isSponsored && <SponsoredLabel />}
            </div>
            {episode.caption && (
              <p className="mt-2.5 whitespace-pre-wrap text-base text-ink">{episode.caption}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
