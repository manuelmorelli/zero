"use client";

import { useId, useState } from "react";
import { EpisodeVideoField, type EpisodeVideoStatus } from "@/components/creator/EpisodeVideoField";
import { FIELD } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Primo episodio caricato direttamente nella pagina "Create Your Journey" (vedi
 * createJourneyWithFirstEpisode in lib/actions/episode.ts): facoltativo, e i suoi campi diventano
 * obbligatori solo quando c'è un video. */
export function FirstEpisodeSection({ onBusyChange }: { onBusyChange: (busy: boolean) => void }) {
  const uid = useId();
  const [hasVideo, setHasVideo] = useState(false);

  function handleVideoStatus({ hasVideo: nextHasVideo, busy }: EpisodeVideoStatus) {
    setHasVideo(nextHasVideo);
    onBusyChange(busy);
  }

  return (
    <section className="mt-6 border-t border-border pt-5">
      <SectionTitle>
        First Episode <span className="text-sm font-medium text-ink-faint">(optional)</span>
      </SectionTitle>
      <p className="mt-1 text-sm text-ink-muted">Add it now, or later from your Journey page.</p>

      <div className="mt-4 space-y-4">
        <EpisodeVideoField onChange={handleVideoStatus} />

        {hasVideo && (
          <>
            <div>
              <label htmlFor={`${uid}-title`} className="text-sm font-medium text-ink-muted">
                Episode Title
              </label>
              <input
                id={`${uid}-title`}
                name="episodeTitle"
                type="text"
                required
                minLength={2}
                maxLength={100}
                placeholder="Give this episode a title"
                className={cn(FIELD, "mt-1.5")}
              />
            </div>

            <div>
              <label htmlFor={`${uid}-caption`} className="text-sm font-medium text-ink-muted">
                Caption
              </label>
              <textarea
                id={`${uid}-caption`}
                name="episodeCaption"
                rows={3}
                maxLength={10000}
                placeholder="Tell what happened in this episode."
                className={cn(FIELD, "mt-1.5 resize-none")}
              />
            </div>

            <div>
              <label htmlFor={`${uid}-occurredAt`} className="text-sm font-medium text-ink-muted">
                When It Happened
              </label>
              <input
                id={`${uid}-occurredAt`}
                name="occurredAt"
                type="date"
                required
                defaultValue={todayInputValue()}
                className={cn(FIELD, "mt-1.5")}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
