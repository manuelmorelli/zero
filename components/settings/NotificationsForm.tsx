"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { updateNotificationPreferences } from "@/lib/actions/settings";

type NotificationsFormProps = {
  notifyNewEpisode: boolean;
  notifyNewJourney: boolean;
  notifyQuestionAnswered: boolean;
};

const TOGGLES: Array<{ name: keyof NotificationsFormProps; label: string; description: string }> = [
  {
    name: "notifyNewEpisode",
    label: "New episodes",
    description: "When a creator you follow publishes a new episode.",
  },
  {
    name: "notifyNewJourney",
    label: "New Journeys",
    description: "When a creator you follow publishes a new Journey.",
  },
  {
    name: "notifyQuestionAnswered",
    label: "Answers to your questions",
    description: "When someone answers a question you posted as an Update.",
  },
];

export function NotificationsForm(props: NotificationsFormProps) {
  const [state, formAction, pending] = useActionState(updateNotificationPreferences, { error: null });
  const [values, setValues] = useState(props);
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
      <div className="divide-y divide-border rounded-lg border border-border">
        {TOGGLES.map((toggle) => (
          <label
            key={toggle.name}
            className="flex items-center justify-between gap-4 px-4 py-3.5"
          >
            <span>
              <span className="block text-sm font-medium text-ink">{toggle.label}</span>
              <span className="block text-xs text-ink-muted">{toggle.description}</span>
            </span>
            <input
              type="checkbox"
              name={toggle.name}
              checked={values[toggle.name]}
              onChange={(event) =>
                setValues((current) => ({ ...current, [toggle.name]: event.target.checked }))
              }
              className="peer sr-only"
            />
            <span
              className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                values[toggle.name] ? "bg-ink" : "bg-surface-2"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-bg transition-transform ${
                  values[toggle.name] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
          </label>
        ))}
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
