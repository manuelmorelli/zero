"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { updateInterests } from "@/lib/actions/settings";
import { JOURNEY_CATEGORIES, type JourneyCategory } from "@/lib/constants/categories";

export function InterestsForm({ interests }: { interests: JourneyCategory[] }) {
  const [state, formAction, pending] = useActionState(updateInterests, { error: null });
  const [selected, setSelected] = useState<JourneyCategory[]>(interests);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !pending && !state.error) {
      toast.success("Interests updated");
      submitted.current = false;
    }
  }, [pending, state.error]);

  function toggle(category: JourneyCategory) {
    setSelected((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  }

  return (
    <form
      action={(formData) => {
        submitted.current = true;
        formAction(formData);
      }}
      className="space-y-5"
    >
      <div className="flex flex-wrap gap-2">
        {JOURNEY_CATEGORIES.map((category) => {
          const active = selected.includes(category);
          return (
            <label key={category}>
              <input
                type="checkbox"
                name="interests"
                value={category}
                checked={active}
                onChange={() => toggle(category)}
                className="sr-only"
              />
              <span
                className={`inline-block cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-ink bg-ink text-bg"
                    : "border-border bg-surface-2 text-ink hover:border-ink-muted"
                }`}
              >
                {category}
              </span>
            </label>
          );
        })}
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || selected.length === 0}
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
