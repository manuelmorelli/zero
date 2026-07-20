"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { authClient } from "@/lib/auth-client";

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
          Bentornato
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Accedi per continuare il tuo Journey.
        </p>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-ink-muted">
          Non hai un account?{" "}
          <Link
            href="/register"
            className="font-semibold text-ink hover:underline"
          >
            Registrati
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
      setError(signInError.message ?? "Accesso non riuscito. Riprova.");
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
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-ink-muted">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-ink-muted hover:text-ink hover:underline"
          >
            Password dimenticata?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {needsVerification && (
        <p className="text-sm text-ink-muted">
          Ti abbiamo appena inviato un nuovo link di conferma via email.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {loading ? "Accesso in corso…" : "Accedi"}
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
