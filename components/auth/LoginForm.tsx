"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { PasswordField } from "@/components/common/PasswordField";
import { FIELD } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function LoginForm() {
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
      const isUnverifiedEmail = signInError.message === "Email not verified";
      // status 401 = credenziali sbagliate davvero; qualsiasi altro status (500, errore di rete...)
      // è un problema del server, non dell'utente, e va detto in modo onesto (bug segnalato da
      // Manuel: un 500 mostrava comunque "wrong password", facendo credere all'utente di aver
      // sbagliato lui mentre l'account era intatto).
      if (isUnverifiedEmail) {
        setError(signInError.message ?? null);
      } else if (signInError.status === 401) {
        setError(signInError.message ?? "Wrong email or password.");
      } else {
        setError("We're having a technical issue. Please try again in a moment.");
      }
      // con emailVerification.sendOnSignIn attivo, questo tentativo ha già
      // fatto ripartire una nuova email di conferma
      setNeedsVerification(isUnverifiedEmail);
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
            className="text-sm text-ink-muted hover:text-ink hover:underline"
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

      <Button variant="primary" type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
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
        className={cn(FIELD, "mt-1.5")}
      />
    </div>
  );
}
