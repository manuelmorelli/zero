"use client";

import { useActionState } from "react";
import { archiveJourney } from "@/lib/actions/journey";

export function JourneyArchiveButton({ journeyId }: { journeyId: string }) {
  const [state, formAction, pending] = useActionState(archiveJourney, { error: null });

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Archive this Journey? It will stop being your active Journey, but stays visible on your public profile — it can't be deleted or unarchived. You'll be able to start a new Journey right away."
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="journeyId" value={journeyId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-danger transition-colors hover:border-danger disabled:opacity-50"
      >
        {pending ? "Archiving…" : "Archive Journey"}
      </button>
      {state.error && <p className="mt-2 text-sm text-danger">{state.error}</p>}
    </form>
  );
}
