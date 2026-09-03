"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { updateCreatorNotificationPreferences } from "@/lib/actions/settings";

type CreatorNotificationsFormProps = {
  notifyNewFollower: boolean;
};

export function CreatorNotificationsForm({ notifyNewFollower }: CreatorNotificationsFormProps) {
  const [state, formAction, pending] = useActionState(updateCreatorNotificationPreferences, { error: null });
  const [checked, setChecked] = useState(notifyNewFollower);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !pending && !state.error) {
      toast.success("Notification preferences updated");
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
      <div className="rounded-lg border border-border">
        <label className="flex items-center justify-between gap-4 px-4 py-3.5">
          <span>
            <span className="block text-sm font-medium text-ink">New follower</span>
            <span className="block text-xs text-ink-muted">When someone starts following you.</span>
          </span>
          <input
            type="checkbox"
            name="notifyNewFollower"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            className="peer sr-only"
          />
          <span
            className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
              checked ? "bg-ink" : "bg-surface-2"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-bg transition-transform ${
                checked ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
        </label>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
