"use client";

import { useActionState } from "react";
import { createCreatorProfile } from "@/lib/actions/creator";

export function CreatorProfileForm() {
  const [state, formAction, pending] = useActionState(createCreatorProfile, {
    error: null,
  });

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div>
        <label htmlFor="displayName" className="text-sm font-medium text-ink-muted">
          Nome visualizzato
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          minLength={2}
          maxLength={60}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium text-ink-muted">
          Descrizione <span className="text-ink-faint">(opzionale)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={500}
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Creazione profilo…" : "Crea profilo creator"}
      </button>
    </form>
  );
}