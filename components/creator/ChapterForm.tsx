"use client";

import { useActionState, useId } from "react";
import { createChapter, updateChapter } from "@/lib/actions/chapter";
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
          Chapter Title
        </label>
        <input
          id={`${uid}-title`}
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={100}
          defaultValue={chapter?.title}
          className={cn(FIELD, "mt-1.5")}
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
          className={cn(FIELD, "mt-1.5 resize-none")}
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button variant="primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : chapter ? "Save changes" : "Add chapter"}
      </Button>
    </form>
  );
}
