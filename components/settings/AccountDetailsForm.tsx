"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { updateAccountDetails } from "@/lib/actions/settings";

type AccountDetailsFormProps = {
  name: string;
  username: string | null;
  bio: string | null;
  location: string | null;
};

export function AccountDetailsForm({ name, username, bio, location }: AccountDetailsFormProps) {
  const [state, formAction, pending] = useActionState(updateAccountDetails, { error: null });
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !pending && !state.error) {
      toast.success("Account updated");
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
          defaultValue={name}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
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
          defaultValue={username ?? ""}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <label htmlFor="location" className="text-sm font-medium text-ink-muted">
          Location <span className="text-ink-faint">(optional)</span>
        </label>
        <input
          id="location"
          name="location"
          type="text"
          maxLength={100}
          placeholder="e.g. Lisbon, Portugal"
          defaultValue={location ?? ""}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <label htmlFor="bio" className="text-sm font-medium text-ink-muted">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={5}
          maxLength={250}
          defaultValue={bio ?? ""}
          placeholder="Tell your story: who you are, what you're working on, why it matters."
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <p className="text-xs text-ink-muted">
        To change your profile or cover photo, open{" "}
        <span className="font-medium text-ink">Edit profile</span> from your profile page.
      </p>

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
