"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Maximize, Pause, PenLine, Play, Video as VideoIcon, Volume2, VolumeX, X } from "lucide-react";
import { toast } from "sonner";
import { createPresentationVideoUploadUrl, updatePresentationVideo } from "@/lib/actions/creatorPresentation";
import { uploadFileWithProgress } from "@/lib/upload";
import { ALLOWED_VIDEO_TYPES } from "@/lib/constants/video";
import { VideoPlayer, type VideoPlayerHandle } from "@/components/common/VideoPlayer";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/heading";
import { CoverTitle } from "@/components/ui/cover-card";
import { PANEL_ACCENT } from "@/components/ui/panel";

type PresentationVideoCardProps = {
  /** Link temporaneo già risolto (chiave R2 -> URL), o null se non è mai stato caricato nulla. */
  videoUrl: string | null;
  isOwnProfile: boolean;
  /** Bio incorporata nella stessa card (richiesto da Manuel, 2026-09-22): unica card invece di
   * due separate, stesso contenuto/stile prima mostrato da AboutCard. AboutCard resta usata da
   * sola quando questa card non compare affatto (visitatore su un profilo senza ancora un video
   * di presentazione, vedi app/(site)/profile/[username]/page.tsx). */
  name: string;
  bio: string | null;
  interests?: string[];
};

/**
 * Card unica Bio + Video di presentazione. Il video attiva il Trust Score alla prima
 * valorizzazione (vedi lib/profile/trustScore.ts, "hasPresentation"). Un visitatore che non ha
 * ancora caricato nulla non vede la card (niente riquadri vuoti su un profilo altrui): in quel
 * caso resta solo AboutCard, vedi sopra. Il proprietario la vede sempre, anche con video vuoto,
 * per poter caricarlo.
 */
export function PresentationVideoCard({ videoUrl, isOwnProfile, name, bio, interests }: PresentationVideoCardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  async function handleFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      setError("Unsupported video format.");
      return;
    }

    setProgress(0);
    try {
      const result = await createPresentationVideoUploadUrl(file.type);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      await uploadFileWithProgress(result.uploadUrl, file, setProgress);
      const saveResult = await updatePresentationVideo(result.key);
      if (saveResult.error) {
        setError(saveResult.error);
      } else {
        toast.success("Introduction video updated");
        router.refresh();
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  if (!videoUrl && !isOwnProfile) return null;

  return (
    <div className={PANEL_ACCENT}>
      {/* Card orizzontale (richiesto da Manuel, 2026-09-22): Bio a sinistra, video di
          presentazione a destra, divise da un bordo verticale. In colonna solo su mobile, dove
          affiancarle non c'entra. Su schermi larghi NON usa una propria proporzione fissa (le due
          colonne hanno larghezze diverse, 34% e 50%: stessa proporzione avrebbe dato altezze
          diverse) — eredita invece l'altezza vera della card "In Progress" (FeaturedJourneySection)
          tramite lo stretch di default della griglia che le affianca (vedi
          app/(site)/profile/[username]/page.tsx), riempiendola con h-full. Ogni lato scorre se il
          contenuto (bio lunga, o i tasti sotto il video) non ci sta tutto. h-full arriva solo da
          lg: in su, la stessa soglia in cui la griglia della pagina affianca le due card (sotto
          quella soglia sono impilate una sopra l'altra, "ereditare" un'altezza non avrebbe senso). */}
      <div className="flex flex-col gap-4 md:flex-row lg:h-full lg:overflow-hidden">
        <div className="md:w-[55%] md:shrink-0 md:overflow-y-auto">
          <CardTitle as="h2" className="inline-flex items-center gap-1.5 text-ember">
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
            Bio
          </CardTitle>
          {bio ? (
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{bio}</p>
          ) : (
            <p className="mt-3 text-sm text-ink-faint">{name} hasn&apos;t written a bio yet.</p>
          )}
          {interests && interests.length > 0 && (
            <div className="mt-4">
              <p className="text-sm uppercase tracking-wider text-ink-faint">Focus</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full border border-border px-2.5 py-1 text-sm text-ink-muted"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4 md:w-full md:overflow-y-auto md:border-l md:border-t-0 md:pl-4 md:pt-0">
        {/* Con il video presente il titolo vive dentro il poster (stile ContentCard, vedi sotto):
            l'intestazione esterna resta solo per lo stato vuoto, altrimenti sarebbe doppia. */}
        {!videoUrl && (
          <CardTitle as="h2" className="inline-flex items-center gap-1.5 text-ember">
            <VideoIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Who I am
          </CardTitle>
        )}

        {videoUrl ? (
          <>
            {/* Prova (2026-09-22, richiesta da Manuel): stesso stile "poster" delle card di Recent
                Episodes (components/profile/ContentCard.tsx) — riquadro 4/3, video ritagliato per
                riempirlo (object-cover, come le foto di copertina degli episodi), titolo "Who I am"
                sovrapposto in basso su sfumatura scura. A differenza delle card episodio, qui il
                video è vero e riproducibile sul posto (play/volume in alto a destra), non solo una
                foto statica che porta altrove. Lo schermo intero (Maximize) apre la stessa
                dimensione "di default" usata per i video dei Journey
                (components/common/VideoPlayer.tsx). */}
            <div
              className="group relative mt-3 aspect-4/3 w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-surface-2"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                playsInline
                className="h-full w-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <div className="absolute inset-0 card-scrim" />

              {!isPlaying && (
                <span className="pointer-events-none absolute inset-0 grid place-items-center text-on-photo">
                  <Play className="h-10 w-10" fill="currentColor" aria-hidden="true" />
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 p-3">
                <CoverTitle className="truncate">Who I Am</CoverTitle>
              </div>
            </div>

            {/* Tasti fuori dal riquadro del video, non più sovrapposti sopra l'immagine. */}
            <div className="mt-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="grid h-8 w-8 place-items-center rounded-full border border-border text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" fill="currentColor" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" fill="currentColor" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="grid h-8 w-8 place-items-center rounded-full border border-border text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                aria-label="Watch fullscreen"
                className="grid h-8 w-8 place-items-center rounded-full border border-border text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
              >
                <Maximize className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {expanded && <ExpandedPresentationVideo videoUrl={videoUrl} onClose={() => setExpanded(false)} />}
          </>
        ) : (
          <p className="mt-3 text-sm text-ink-faint">
            {isOwnProfile ? "Add a short video so people know who you are." : "No introduction video yet."}
          </p>
        )}

        {isOwnProfile && (
          <>
            <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={progress !== null} className="mt-3 w-full">
              {progress !== null ? `Uploading… ${progress}%` : videoUrl ? "Change video" : "Upload video"}
            </Button>
            <input ref={inputRef} type="file" accept="video/*" onChange={handleFileChosen} className="hidden" />
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          </>
        )}
        </div>
      </div>
    </div>
  );
}

/**
 * Vista ingrandita del video di presentazione, aperta dal tasto Maximize nella card. Usa lo
 * stesso VideoPlayer "di default" (dimensione naturale, fino al 70% dell'altezza schermo, stessa
 * barra di controllo) dei video degli episodi, richiesto esplicitamente da Manuel per coerenza in
 * tutto il sito — niente ritaglio 16/10 qui, quello resta solo per l'anteprima nella card.
 */
function ExpandedPresentationVideo({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  const playerRef = useRef<VideoPlayerHandle>(null);

  useEffect(() => {
    const video = playerRef.current?.video;
    if (video) video.src = videoUrl;
  }, [videoUrl]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-scrim p-6"
      onClick={onClose}
    >
      {/* La X sta sull'angolo della card del video, non della pagina intera: il video ha
          dimensione naturale (VideoPlayer è inline-block), quindi questo riquadro relative si
          stringe esattamente attorno ad esso, e la X assoluta lo segue. */}
      <div className="relative" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -right-3 -top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-border bg-scrim text-on-photo backdrop-blur-md transition-colors hover:bg-bg"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <VideoPlayer ref={playerRef} showSkipBack={false} />
      </div>
    </div>,
    document.body
  );
}
