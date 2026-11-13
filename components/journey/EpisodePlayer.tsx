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
import { HighlightsDropdown } from "@/components/journey/HighlightsDropdown";
import { ShareButton } from "@/components/common/ShareButton";
import { ExpandableText } from "@/components/common/ExpandableText";
import { CoverMenu } from "@/components/journey/CoverMenu";
import { FollowButton } from "@/components/profile/FollowButton";
import { VideoPlayer, type VideoPlayerHandle } from "@/components/common/VideoPlayer";
import { EpisodeMusic } from "@/components/journey/EpisodeMusic";
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
    /** Musica di sottofondo dalla Libreria Zero, null se l'episodio non ne ha. */
    music: { trackId: string; volume: number; fade: boolean } | null;
  };
  initialPositionSec: number;
  initialCompleted: boolean;
  initialLikeCount: number;
  initialIsLiked: boolean;
  isLoggedIn: boolean;
  isOwnContent: boolean;
  /** Solo per il Follow in riga 1 su telefono (il player da computer non ha un bottone Follow). */
  isFollowing: boolean;
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
  isFollowing,
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

    // Il browser può rifiutare la partenza automatica con l'audio acceso se in quel preciso
    // momento nessuno ha appena toccato/cliccato niente (regola di sicurezza di tutti i browser,
    // più rigida su Safari iPhone). In quel caso riprova muto: la partenza muta è sempre permessa,
    // e il video in listener onPlay toglie il segnale, quindi il video non resta mai fermo.
    const start = () => video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => {});
    });
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
      <div className={episode.videoSrc ? "md:flex md:justify-center" : ""}>
        <div className="grid gap-4">
          {episode.videoSrc ? (
            <div className="relative -mx-5 md:mx-0">
            {episode.music && (
              <EpisodeMusic
                playerRef={playerRef}
                trackId={episode.music.trackId}
                volume={episode.music.volume}
                fade={episode.music.fade}
              />
            )}
            <VideoPlayer
              ref={playerRef}
              posterUrl={episode.posterUrl}
              fullWidthMobile
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
            {/* Menu a tre puntini sopra il video, solo telefono: Forum, Segnala l'episodio,
             * Modifica episodio. Condividi resta in riga 1 qui sotto, non duplicato nel menu
             * (diverso dalla copertina Journey). */}
            <div className="absolute right-3 top-3 md:hidden">
              <CoverMenu
                forumHref={`/community/forum/${journeyId}`}
                report={!isOwnContent && isLoggedIn ? { targetType: "EPISODE", targetId: episode.id } : undefined}
                editHref={isOwnContent ? `/dashboard/journeys/${journeyId}?edit=${episode.id}` : undefined}
                editLabel="Edit Episode"
              />
            </div>
            </div>
          ) : (
            <div className="grid aspect-video w-full place-items-center rounded-2xl border border-border bg-black text-sm text-ink-muted">
              No video for this episode yet.
            </div>
          )}

          <div className="relative">
            {/* Da computer: icone sopra a destra (ora anche Follow, accanto a Trusty), riga
             * Journey·Episode·categoria con Highlights in linea, titolo, riga creator, caption
             * intera. Su telefono questo blocco non esiste, sotto c'è la sua versione a parte. */}
            <div className="hidden md:block">
              <div className="absolute right-0 top-0 flex items-center gap-1.5 scale-125 origin-top-right">
                {!isOwnContent && (
                  <FollowButton userId={creator.userId} initialIsFollowing={isFollowing} isLoggedIn={isLoggedIn} className="py-1.5" />
                )}
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
              <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
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
                {isOwnContent && <HighlightsDropdown highlights={highlights} onRemove={remove} />}
              </div>
              <div className="mt-1.5 pr-32 md:pr-64">
                <p className="text-sm leading-none tracking-[0.22em] text-ember uppercase">
                  {journeyTitle} ·
                  Episode {episode.number}
                  {journeyCategory ? ` · ${journeyCategory}` : ""}
                </p>
              </div>
              <PageTitle className="mt-1">
                {episode.title}
              </PageTitle>
              {episode.caption && (
                <p className="mt-2.5 whitespace-pre-wrap text-base text-ink">{episode.caption}</p>
              )}
            </div>

            {/* Telefono: nome+Follow+Condividi e Trusty in riga 1 (al posto del titolo), numero
             * episodio con Highlights a tendina in riga 2, titolo in riga 3, caption di una riga
             * con "more" (vedi mockup approvato). */}
            <div className="md:hidden">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${creator.userId}`}
                  className="flex min-w-0 items-center gap-2 transition-colors hover:text-ember"
                >
                  <Avatar name={creator.displayName} avatarUrl={creator.avatarUrl} size="sm" className="h-[46px] w-[46px]" />
                  <span className="truncate text-base font-semibold text-ink">{creator.displayName}</span>
                </Link>
                {isOwnContent && <HighlightsDropdown highlights={highlights} onRemove={remove} />}
                <span className="flex-1" />
                {!isOwnContent && (
                  <FollowButton userId={creator.userId} initialIsFollowing={isFollowing} isLoggedIn={isLoggedIn} className="py-1.5" />
                )}
                <TrustyButton
                  targetType="EPISODE"
                  targetId={episode.id}
                  initialLikeCount={initialLikeCount}
                  initialIsLiked={initialIsLiked}
                  isLoggedIn={isLoggedIn}
                  unlocked={trustyUnlocked}
                  isOwnContent={isOwnContent}
                  className="py-1.5"
                />
              </div>

              <div className="mt-3.5 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-bold leading-none tracking-[0.18em] text-ember uppercase">
                    {journeyTitle} · Episode {episode.number}
                  </p>
                  {episode.isSponsored && <SponsoredLabel />}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ShareButton
                    path={`/journeys/${journeyId}/episodes/${episode.id}`}
                    label={episode.title}
                    updateCaption={
                      isOwnContent
                        ? `New episode: ${episode.title}`
                        : `Check out this episode by ${creator.displayName}: ${episode.title}`
                    }
                    linkedEpisodeId={episode.id}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ember transition-opacity hover:opacity-80"
                    iconClassName="h-5 w-5"
                  />
                </div>
              </div>

              <PageTitle className="mt-2.5 text-3xl">
                {episode.title}
              </PageTitle>

              {episode.caption && (
                <ExpandableText text={episode.caption} clampLines={2} className="mt-2.5 text-lg text-on-photo" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
