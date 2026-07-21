"use client";

import { useActionState, useId } from "react";
import { createEpisode, updateEpisode } from "@/lib/actions/episode";

type EpisodeFormProps = {
  chapterId: string;
  episode?: {
    id: string;
    title: string;
    caption: string | null;
    videoUrl: string | null;
    occurredAt: Date;
  };
};

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function EpisodeForm({ chapterId, episode }: EpisodeFormProps) {
  const uid = useId();
  const [state, formAction, pending] = useActionState(
    episode ? updateEpisode : createEpisode,
    { error: null }
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name={episode ? "episodeId" : "chapterId"} value={episode ? episode.id : chapterId} />

      <div>
        <label htmlFor={`${uid}-title`} className="text-sm font-medium text-ink-muted">
          Episode title
        </label>
        <input
          id={`${uid}-title`}
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={100}
          defaultValue={episode?.title}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <label htmlFor={`${uid}-caption`} className="text-sm font-medium text-ink-muted">
          Caption <span className="text-ink-faint">(optional)</span>
        </label>
        <textarea
          id={`${uid}-caption`}
          name="caption"
          rows={5}
          maxLength={10000}
          placeholder="Tell what happened in this episode."
          defaultValue={episode?.caption ?? undefined}
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <label htmlFor={`${uid}-videoUrl`} className="text-sm font-medium text-ink-muted">
          Video URL (temporary) <span className="text-ink-faint">(optional)</span>
        </label>
        <input
          id={`${uid}-videoUrl`}
          name="videoUrl"
          type="url"
          maxLength={500}
          placeholder="https://…"
          defaultValue={episode?.videoUrl ?? undefined}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <label htmlFor={`${uid}-occurredAt`} className="text-sm font-medium text-ink-muted">
          When it actually happened
        </label>
        <input
          id={`${uid}-occurredAt`}
          name="occurredAt"
          type="date"
          required
          defaultValue={toDateInputValue(episode?.occurredAt ?? new Date())}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Saving…" : episode ? "Save changes" : "Add episode"}
      </button>
    </form>
  );
}
