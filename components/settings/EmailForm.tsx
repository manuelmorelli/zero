"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const { error } = await authClient.changeEmail({
      newEmail,
      callbackURL: "/settings/security",
    });
    setPending(false);

    if (error) {
      toast.error(error.message ?? "Couldn't change email.");
      return;
    }

    toast.success(`Check ${newEmail} for a confirmation link to finish the change.`);
    setNewEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-medium text-ink-muted">Current email</p>
        <p className="mt-1.5 text-sm text-ink">{currentEmail}</p>
      </div>

      <div>
        <label htmlFor="newEmail" className="text-sm font-medium text-ink-muted">
          New email
        </label>
        <input
          id="newEmail"
          type="email"
          required
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
        <p className="mt-1.5 text-xs text-ink-muted">
          We&apos;ll send a confirmation link to the new address before the change takes effect.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending || !newEmail}
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Sending…" : "Change email"}
      </button>
    </form>
  );
}
