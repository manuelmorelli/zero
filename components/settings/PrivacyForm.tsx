"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { updatePrivateAccount } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";

export function PrivacyForm({ isPrivate }: { isPrivate: boolean }) {
  const [state, formAction, pending] = useActionState(updatePrivateAccount, { error: null });
  const [value, setValue] = useState(isPrivate);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !pending && !state.error) {
      toast.success("Privacy settings updated");
      submitted.current = false;
    }
  }, [pending, state.error]);

  return (
    <form
      action={(formData) => {
        submitted.current = true;
        formAction(formData);
      }}
      className="space-y-5"
    >
      <label className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3.5">
        <span>
          <span className="block text-sm font-medium text-ink">Private account</span>
          <span className="block text-sm text-ink-muted">
            People who don&apos;t follow you will only see your name, photo and bio, not your
            Journeys or Updates. Following still happens instantly, no approval needed.
          </span>
        </span>
        <input
          type="checkbox"
          name="isPrivate"
          checked={value}
          onChange={(event) => setValue(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
            value ? "bg-ink" : "bg-surface-2"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-bg transition-transform ${
              value ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </span>
      </label>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button variant="primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
