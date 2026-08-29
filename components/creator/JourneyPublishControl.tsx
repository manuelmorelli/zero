"use client";

import { useActionState } from "react";
import { publishJourney } from "@/lib/actions/journey";

type JourneyPublishControlProps = {
  journeyId: string;
  status: string;
};

/** Solo l'azione "Publish": una volta pubblicato, tornare in Draft è un'azione secondaria che
 * vive nel menu "···" (vedi JourneyHeaderMenu), non più qui come bottone sempre visibile. */
export function JourneyPublishControl({ journeyId, status }: JourneyPublishControlProps) {
  if (status !== "DRAFT") return null;
  return <PublishForm journeyId={journeyId} />;
}

function PublishForm({ journeyId }: { journeyId: string }) {
  const [state, formAction, pending] = useActionState(publishJourney, { error: null });

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="journeyId" value={journeyId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Publishing…" : "Publish"}
      </button>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}