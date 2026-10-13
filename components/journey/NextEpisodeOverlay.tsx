"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ButtonPrimary, ButtonSecondary, TextButton } from "@/components/ui/button";
import { PANEL } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

const COUNTDOWN_SEC = 5;
/** Chiave con cui l'episodio di partenza dice al successivo "parti da solo": letta da EpisodePlayer. */
export const AUTOPLAY_STORAGE_KEY = "zero:autoplay-episode";

export type NextEpisodeInfo = {
  id: string;
  number: number;
  title: string;
  posterUrl: string | null;
};

type NextEpisodeOverlayProps = {
  journeyId: string;
  next: NextEpisodeInfo | null;
  onWatchAgain: () => void;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Riquadro sopra il player a fine episodio: conto alla rovescia verso il prossimo episodio, oppure
 * (ultimo episodio) il messaggio di Journey finito. Compare solo dopo la fine del video, quindi
 * sempre nel browser. Con "meno movimento" attivo non c'è avvio automatico, solo "Play now".
 */
export function NextEpisodeOverlay({ journeyId, next, onWatchAgain }: NextEpisodeOverlayProps) {
  const router = useRouter();
  const navigatedRef = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(() =>
    next && !prefersReducedMotion() ? COUNTDOWN_SEC : null
  );

  function playNext() {
    if (!next || navigatedRef.current) return;
    navigatedRef.current = true;
    try {
      sessionStorage.setItem(AUTOPLAY_STORAGE_KEY, next.id);
    } catch {
      // Senza storage l'episodio si apre comunque, solo non parte da solo.
    }
    router.push(`/journeys/${journeyId}/episodes/${next.id}`);
  }

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      playNext();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((current) => (current === null ? null : current - 1)), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  return (
    <div className="fade-in-soft absolute inset-0 grid place-items-center bg-scrim p-3 leading-normal">
      {next ? (
        <div className={cn(PANEL, "flex w-full max-w-md items-center gap-4 p-4")}>
          {next.posterUrl && (
            <span className="relative hidden aspect-4/3 w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2 sm:block">
              <Image src={next.posterUrl} alt="" fill sizes="112px" className="object-cover" />
            </span>
          )}
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm tracking-[0.18em] text-ember uppercase">
              Up next · Episode {next.number}
            </p>
            <p className="mt-0.5 truncate text-base font-semibold text-ink">{next.title}</p>
            {secondsLeft !== null && (
              <p className="mt-0.5 text-sm text-ink-muted" aria-live="polite">
                Starting in {secondsLeft}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <ButtonPrimary onClick={playNext} className="px-4 py-2">
                Play now
              </ButtonPrimary>
              {secondsLeft !== null && <TextButton onClick={() => setSecondsLeft(null)}>Cancel</TextButton>}
            </div>
          </div>
        </div>
      ) : (
        <div className={cn(PANEL, "w-full max-w-md p-4 text-center")}>
          <p className="text-base font-semibold text-ink">You finished this Journey</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
            <ButtonPrimary onClick={onWatchAgain} className="px-4 py-2">
              Watch again
            </ButtonPrimary>
            <ButtonSecondary href={`/journeys/${journeyId}`} className="px-4 py-2">
              Back to Journey
            </ButtonSecondary>
          </div>
        </div>
      )}
    </div>
  );
}
