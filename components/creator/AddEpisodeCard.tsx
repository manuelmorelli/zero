"use client";

import { useActionState, useId, useState } from "react";
import { createEpisode } from "@/lib/actions/episode";
import { EpisodeVideoField, type EpisodeVideoStatus } from "@/components/creator/EpisodeVideoField";
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type Chapter = { id: string; title: string };

type AddEpisodeCardProps = {
  journeyId: string;
  chapters: Chapter[];
  defaultChapterId?: string | null;
};

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Stessa esperienza in due gesti della card "+" (video -> Publish), applicata dentro un Journey
 * già scelto (niente selettore Journey, non serve): usata dal bottone "Add Episode" della
 * dashboard al posto del vecchio form più macchinoso (vedi AddEpisodeButton.tsx). A differenza
 * del "+" globale, qui resta l'interruttore Bozza/Pubblicato — richiesto esplicitamente da
 * Manuel, unica vera differenza funzionale rimasta tra i due flussi. */
export function AddEpisodeCard({ journeyId, chapters, defaultChapterId }: AddEpisodeCardProps) {
  const uid = useId();
  const [state, formAction, pending] = useActionState(createEpisode, { error: null });

  const [hasVideo, setHasVideo] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [chapterId, setChapterId] = useState(defaultChapterId ?? "");
  const [occurredAt, setOccurredAt] = useState(todayInputValue());
  const [published, setPublished] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);

  // Un episodio nuovo con un video pronto parte pubblicato di default (come il "+"): resta
  // comunque possibile riportarlo a Bozza con l'interruttore sotto, prima di salvare.
  function handleVideoStatus({ hasVideo: nextHasVideo, busy }: EpisodeVideoStatus) {
    if (nextHasVideo && !hasVideo) setPublished(true);
    setHasVideo(nextHasVideo);
    setVideoBusy(busy);
  }

  return (
    <form action={formAction} className="sm:grid sm:grid-cols-[260px_1fr] sm:gap-6">
      <input type="hidden" name="journeyId" value={journeyId} />
      <EpisodeVideoField onChange={handleVideoStatus} pickerClassName="sm:h-full sm:justify-center sm:py-0" />

      <div className="mt-4 space-y-4 sm:mt-0">
        <div>
          <label htmlFor={`${uid}-title`} className="text-sm font-medium text-ink-muted">
            Episode Title
          </label>
          <input
            id={`${uid}-title`}
            name="title"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
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
            name="caption"
            rows={3}
            maxLength={10000}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Tell what happened in this episode."
            className={cn(FIELD, "mt-1.5 resize-none")}
          />
        </div>

        <button
          type="button"
          onClick={() => setAdvanced((value) => !value)}
          className="text-sm font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          {advanced ? "Hide options" : chapters.length > 0 ? "More options (chapter, date)" : "More options (date)"}
        </button>

        <div className={advanced ? "space-y-4" : "hidden"}>
          {chapters.length > 0 && (
            <div>
              <label htmlFor={`${uid}-chapter`} className="text-sm font-medium text-ink-muted">
                Chapter
              </label>
              <select
                id={`${uid}-chapter`}
                name="chapterId"
                value={chapterId}
                onChange={(event) => setChapterId(event.target.value)}
                className={cn(FIELD, "mt-1.5")}
              >
                <option value="">No Chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor={`${uid}-occurredAt`} className="text-sm font-medium text-ink-muted">
              When It Happened
            </label>
            <input
              id={`${uid}-occurredAt`}
              name="occurredAt"
              type="date"
              required
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              className={cn(FIELD, "mt-1.5")}
            />
          </div>
        </div>

        <Switch
          name="isSponsored"
          label="Sponsored content"
          description="Turn on if a brand paid you or gave you something to feature it."
          checked={isSponsored}
          onChange={setIsSponsored}
        />

        <label
          className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 ${
            hasVideo ? "" : "opacity-60"
          }`}
        >
          <input
            type="checkbox"
            name="published"
            checked={published}
            disabled={!hasVideo}
            onChange={(event) => setPublished(event.target.checked)}
            className="h-4 w-4 accent-ink disabled:cursor-not-allowed"
          />
          <span className="text-sm font-medium text-ink">
            {published ? "Published" : "Draft"}
            <span className="ml-1 font-normal text-ink-faint">
              {hasVideo ? (published ? "— visible to everyone" : "— only visible to you") : "— add a video first"}
            </span>
          </span>
        </label>

        {state.error && <p className="text-sm text-danger">{state.error}</p>}

        <Button variant="primary" type="submit" disabled={!hasVideo || videoBusy || pending} className="w-full">
          {pending ? "Saving…" : "Add episode"}
        </Button>
      </div>
    </form>
  );
}
