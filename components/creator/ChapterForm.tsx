"use client";

import { useActionState, useId } from "react";
import { createChapter, updateChapter } from "@/lib/actions/chapter";

type ChapterFormProps = {
  journeyId: string;
  chapter?: { id: string; title: string; description: string | null };
};

export function ChapterForm({ journeyId, chapter }: ChapterFormProps) {
  const uid = useId();
  const [state, formAction, pending] = useActionState(
    chapter ? updateChapter : createChapter,
    { error: null }
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name={chapter ? "chapterId" : "journeyId"} value={chapter ? chapter.id : journeyId} />

      <div>
        <label htmlFor={`${uid}-title`} className="text-sm font-medium text-ink-muted">
          Chapter title
        </label>
        <input
          id={`${uid}-title`}
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={100}
          defaultValue={chapter?.title}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <label htmlFor={`${uid}-description`} className="text-sm font-medium text-ink-muted">
          Description <span className="text-ink-faint">(optional)</span>
        </label>
        <textarea
          id={`${uid}-description`}
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="What this phase of the journey is about."
          defaultValue={chapter?.description ?? undefined}
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Saving…" : chapter ? "Save changes" : "Add chapter"}
      </button>
    </form>
  );
}
