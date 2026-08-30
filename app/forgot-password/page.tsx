"use client";

import { useState, type SubmitEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { DevEmailLinkNotice } from "@/components/common/DevEmailLinkNotice";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { BackLink } from "@/components/common/BackLink";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <AuthHeader />
        <h1 className="mt-8 text-2xl font-extrabold tracking-tight">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Enter your email: if it matches an account, we&apos;ll send you a
          link to choose a new one.
        </p>

        <ForgotPasswordForm />

        <div className="mt-6 flex justify-center">
          <BackLink href="/login" label="Back to sign in" />
        </div>
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
        <DevEmailLinkNotice email={email} kind="reset-password" />
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
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
