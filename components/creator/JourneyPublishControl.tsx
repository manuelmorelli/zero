"use client";

import { useActionState } from "react";
import { publishJourney } from "@/lib/actions/journey";
import { Button } from "@/components/ui/button";

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
      <Button variant="primary" type="submit" disabled={pending}>
        {pending ? "Publishing…" : "Publish"}
      </Button>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}