"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
        <p className="text-sm font-medium text-ink-muted">Current Email</p>
        <p className="mt-1.5 text-sm text-ink">{currentEmail}</p>
      </div>

      <div>
        <label htmlFor="newEmail" className="text-sm font-medium text-ink-muted">
          New Email
        </label>
        <input
          id="newEmail"
          type="email"
          required
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
          className={cn(FIELD, "mt-1.5")}
        />
        <p className="mt-1.5 text-sm text-ink-muted">
          We&apos;ll send a confirmation link to the new address before the change takes effect.
        </p>
      </div>

      <Button variant="primary" type="submit" disabled={pending || !newEmail}>
        {pending ? "Sending…" : "Change email"}
      </Button>
    </form>
  );
}
