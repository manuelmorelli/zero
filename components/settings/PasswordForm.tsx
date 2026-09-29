"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
          Current Password
        </label>
        <input
          id="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className={cn(FIELD, "mt-1.5")}
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="text-sm font-medium text-ink-muted">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className={cn(FIELD, "mt-1.5")}
        />
      </div>

      <Button variant="primary" type="submit" disabled={pending || !currentPassword || newPassword.length < 8}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
