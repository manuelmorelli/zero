"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);

    if (error) {
      toast.error(error.message ?? "Couldn't change password. Check your current password.");
      return;
    }

    toast.success("Password updated");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="currentPassword" className="text-sm font-medium text-ink-muted">
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="text-sm font-medium text-ink-muted">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      <button
        type="submit"
        disabled={pending || !currentPassword || newPassword.length < 8}
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
