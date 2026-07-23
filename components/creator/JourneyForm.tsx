"use client";

import { useActionState } from "react";
import { createJourney, updateJourney } from "@/lib/actions/journey";

type JourneyFormProps = {
  journey?: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    tags: string[];
  };
};

export function JourneyForm({ journey }: JourneyFormProps) {
  const [state, formAction, pending] = useActionState(
    journey ? updateJourney : createJourney,
    { error: null }
  );

  return (
    <form action={formAction} className="space-y-4">
      {journey && <input type="hidden" name="journeyId" value={journey.id} />}

      <div>
        <label htmlFor="title" className="text-sm font-medium text-ink-muted">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={100}
          defaultValue={journey?.title}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium text-ink-muted">
          Presentation <span className="text-ink-faint">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          placeholder="Goal, context, motivations, what followers can expect."
          defaultValue={journey?.description ?? undefined}
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="text-sm font-medium text-ink-muted">
            Category <span className="text-ink-faint">(optional)</span>
          </label>
          <input
            id="category"
            name="category"
            type="text"
            maxLength={40}
            defaultValue={journey?.category ?? undefined}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>
        <div>
          <label htmlFor="tags" className="text-sm font-medium text-ink-muted">
            Tags <span className="text-ink-faint">(comma-separated)</span>
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            maxLength={200}
            placeholder="fitness, running"
            defaultValue={journey?.tags.join(", ")}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Saving…" : journey ? "Save changes" : "Create Journey"}
      </button>
    </form>
  );
}
