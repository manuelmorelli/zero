"use client";

import { useActionState, useState } from "react";
import { Rocket } from "lucide-react";
import { quickCreateEpisode } from "@/lib/actions/episode";

/** Scorciatoia "due click" per il primo episodio (stesso pattern del mockup Lovable: solo il
 * titolo, una didascalia di riserva già pronta dietro le quinte, video/copertina/capitolo si
 * aggiungono dopo). Riusa quickCreateEpisode, già pensato per non fare redirect. */
export function FirstEpisodeForm({ journeyId }: { journeyId: string }) {
  const [state, formAction, pending] = useActionState(quickCreateEpisode, { error: null, done: false });
  const [title, setTitle] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <input type="hidden" name="journeyId" value={journeyId} />
      <input type="hidden" name="caption" value="The first episode of your Journey." />
      <input type="hidden" name="occurredAt" value={new Date().toISOString().slice(0, 10)} />
      <input
        autoFocus
        name="title"
        type="text"
        required
        minLength={2}
        maxLength={100}
        placeholder="First episode title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted sm:max-w-md"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
        {pending ? "Publishing…" : "Publish Episode"}
      </button>
      {state.error && <p className="text-sm text-danger sm:basis-full">{state.error}</p>}
    </form>
  );
}
