"use client";

import { useState, type SubmitEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/heading";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <AuthHeader />
        <PageTitle className="mt-8">
          Forgot your password?
        </PageTitle>
        <p className="mt-2 text-sm text-ink-muted">
          Enter your email: if it matches an account, we&apos;ll send you a
          link to choose a new one.
        </p>

        <ForgotPasswordForm />
      </div>
    </main>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: requestError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);

    if (requestError) {
      setError(requestError.message ?? "Request failed. Please try again.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-8">
        <p className="text-sm text-ink">
          Check your email: if the address is registered, you&apos;ll receive
          a password reset link shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className={cn(FIELD, "mt-1.5")}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button variant="primary" type="submit" disabled={loading} className="w-full">
        {loading ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
