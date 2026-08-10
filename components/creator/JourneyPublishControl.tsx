"use client";

import { useActionState } from "react";
import { publishJourney, unpublishJourney } from "@/lib/actions/journey";

type JourneyPublishControlProps = {
  journeyId: string;
  status: string;
};

export function JourneyPublishControl({ journeyId, status }: JourneyPublishControlProps) {
  if (status === "DRAFT") {
    return <PublishForm journeyId={journeyId} />;
  }
  if (status === "PUBLISHED" || status === "DISCOVERY") {
    return <UnpublishForm journeyId={journeyId} />;
  }
  return null;
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

function UnpublishForm({ journeyId }: { journeyId: string }) {
  const [state, formAction, pending] = useActionState(unpublishJourney, { error: null });

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="journeyId" value={journeyId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink-muted disabled:opacity-50"
      >
        {pending ? "Moving to Draft…" : "Move to Draft"}
      </button>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}