"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUpdate } from "@/lib/actions/update";

export function UpdateForm() {
  const [state, formAction, pending] = useActionState(createUpdate, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  // Niente redirect dopo la pubblicazione (a differenza di JourneyForm): resta sulla Dashboard,
  // quindi il campo va svuotato a mano dopo un invio andato a buon fine.
  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <textarea
        name="content"
        rows={3}
        required
        maxLength={500}
        placeholder="Share a quick update with your followers… it disappears after 24 hours."
        className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
      />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Publishing…" : "Publish"}
      </button>
    </form>
  );
}
