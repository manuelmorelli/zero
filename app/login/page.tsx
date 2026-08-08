"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { PasswordField } from "@/components/common/PasswordField";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="font-sans text-xl font-extrabold tracking-tight"
        >
          ZERO
        </Link>
        <h1 className="mt-8 text-2xl font-extrabold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Sign in to continue your Journey.
        </p>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-ink hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* FORM                                                                 */
/* ------------------------------------------------------------------ */

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setLoading(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message ?? "Sign in failed. Please try again.");
      // con emailVerification.sendOnSignIn attivo, questo tentativo ha già
      // fatto ripartire una nuova email di conferma
      setNeedsVerification(signInError.message === "Email not verified");
      return;
    }

    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <Field
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        required
      />
      <PasswordField
        id="password"
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        required
        labelRight={
          <Link
            href="/forgot-password"
            className="text-xs text-ink-muted hover:text-ink hover:underline"
          >
            Forgot password?
          </Link>
        }
      />

      {error && <p className="text-sm text-danger">{error}</p>}
      {needsVerification && (
        <p className="text-sm text-ink-muted">
          We just sent you a new confirmation link by email.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* FIELD                                                                */
/* ------------------------------------------------------------------ */

type FieldProps = {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
};

function Field({ label, id, type, value, onChange, autoComplete, required }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink-muted">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
      />
    </div>
  );
}
