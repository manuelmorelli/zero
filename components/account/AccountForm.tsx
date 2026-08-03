"use client";

import { useActionState, useState } from "react";
import { updateAccount } from "@/lib/actions/account";
import { JOURNEY_CATEGORIES, type JourneyCategory } from "@/lib/constants/categories";

type AccountFormProps = {
  user: {
    name: string;
    username: string | null;
    bio: string | null;
    interests: string[];
  };
};

const BIO_MIN_LENGTH = 250;

export function AccountForm({ user }: AccountFormProps) {
  const [state, formAction, pending] = useActionState(updateAccount, { error: null });
  const [selected, setSelected] = useState<JourneyCategory[]>(
    user.interests as JourneyCategory[]
  );
  const [bioLength, setBioLength] = useState(user.bio?.length ?? 0);

  function toggle(category: JourneyCategory) {
    setSelected((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-ink-muted">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          defaultValue={user.name}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <label htmlFor="username" className="text-sm font-medium text-ink-muted">
          Username <span className="text-ink-faint">(optional)</span>
        </label>
        <input
          id="username"
          name="username"
          type="text"
          maxLength={30}
          placeholder="e.g. jane-doe"
          defaultValue={user.username ?? ""}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="bio" className="text-sm font-medium text-ink-muted">
            Bio
          </label>
          <span className={`text-xs ${bioLength < BIO_MIN_LENGTH ? "text-ink-faint" : "text-ink-muted"}`}>
            {bioLength}/{BIO_MIN_LENGTH} min
          </span>
        </div>
        <textarea
          id="bio"
          name="bio"
          rows={6}
          required
          minLength={BIO_MIN_LENGTH}
          placeholder="Tell your story: who you are, what you're working on, why it matters. Shown on your public profile."
          defaultValue={user.bio ?? ""}
          onChange={(e) => setBioLength(e.target.value.trim().length)}
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-ink-muted">Interests</p>
        <div className="mt-1.5 flex flex-wrap gap-3">
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
                      : "border-border bg-surface-2 text-ink hover:border-ink-muted"
                  }`}
                >
                  {category}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || selected.length === 0 || bioLength < BIO_MIN_LENGTH}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
