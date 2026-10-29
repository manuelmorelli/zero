"use client";

import Link from "next/link";
import { useState, type SubmitEvent } from "react";
import { redeemBetaCode } from "@/lib/actions/betaAccess";
import { Logo } from "@/components/layout/Logo";
import { FIELD } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

export default function BetaAccessPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("code", code);
    const result = await redeemBetaCode(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <Link href="/" aria-label="Zero home" className="inline-flex">
          <Logo className="mx-auto h-7" />
        </Link>
        <PageTitle className="mt-8">Zero is invite-only right now</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">
          Enter the access code you were given to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
          <div>
            <label htmlFor="code" className="text-sm font-medium text-ink-muted">
              Access code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
              autoFocus
              required
              className={cn(FIELD, "mt-1.5")}
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button variant="primary" type="submit" disabled={loading} className="w-full">
            {loading ? "Checking…" : "Enter"}
          </Button>
        </form>
      </div>
    </main>
  );
}
