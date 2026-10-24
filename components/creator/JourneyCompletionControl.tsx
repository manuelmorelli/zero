"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, RotateCcw } from "lucide-react";
import { setJourneyCompleted } from "@/lib/actions/journey";
import { DashboardPanel } from "@/components/creator/DashboardPanel";
import { Button } from "@/components/ui/button";

/** "Mark as completed" / "Reopen Journey", sempre visibile sotto la lista degli episodi: un Journey
 * finito resta in Top e Recommended e non perde più punti col tempo (lib/actions/journey.ts). */
export function JourneyCompletionControl({ journeyId, isCompleted }: { journeyId: string; isCompleted: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(setJourneyCompleted, { error: null });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted && !pending && !state.error) router.refresh();
  }, [submitted, pending, state.error, router]);

  return (
    <DashboardPanel title={isCompleted ? "Journey completed" : "Finished this Journey?"} icon={<Flag className="h-4 w-4" />}>
      <form
        action={(formData) => {
          setSubmitted(true);
          formAction(formData);
        }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <p className="max-w-xl text-sm text-ink-muted">
          {isCompleted
            ? "It stays in Most Trusted and Recommended and no longer loses points over time. Publishing a new episode reopens it automatically."
            : "Mark it as completed when the story is over: it stays in Most Trusted and Recommended and stops losing points over time. You can reopen it anytime."}
        </p>
        <input type="hidden" name="journeyId" value={journeyId} />
        <input type="hidden" name="completed" value={String(!isCompleted)} />
        <Button variant={isCompleted ? "secondary" : "primary"} type="submit" disabled={pending}>
          {isCompleted ? <RotateCcw className="h-4 w-4" aria-hidden="true" /> : <Flag className="h-4 w-4" aria-hidden="true" />}
          {isCompleted ? "Reopen Journey" : "Mark as completed"}
        </Button>
        {state.error && <p className="w-full text-sm text-danger">{state.error}</p>}
      </form>
    </DashboardPanel>
  );
}
