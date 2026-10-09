"use client";

import { useActionState, useState } from "react";
import { saveOnboardingInterests } from "@/lib/actions/onboarding";
import { JOURNEY_CATEGORIES, type JourneyCategory } from "@/lib/constants/categories";
import { Button } from "@/components/ui/button";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(saveOnboardingInterests, {
    error: null,
  });
  const [selected, setSelected] = useState<JourneyCategory[]>([]);

  function toggle(category: JourneyCategory) {
    setSelected((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex flex-wrap gap-3">
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
                className={`inline-block cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-ink bg-ink text-bg"
                    : "border-border bg-surface-2 text-ink hover:border-ember-line"
                }`}
              >
                {category}
              </span>
            </label>
          );
        })}
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button variant="primary" type="submit" disabled={pending || selected.length === 0} className="w-full">
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
