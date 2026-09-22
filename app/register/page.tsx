"use client";

import Link from "next/link";
import { useState, type SubmitEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { PasswordField } from "@/components/common/PasswordField";
import { DevEmailLinkNotice } from "@/components/common/DevEmailLinkNotice";
import { AuthHeader } from "@/components/layout/AuthHeader";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <AuthHeader />
        <h1 className="mt-8 text-2xl font-extrabold tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Start following or sharing your transformation.
        </p>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-ink hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* FORM                                                                 */
/* ------------------------------------------------------------------ */

const MINIMUM_AGE_YEARS = 16;

function isOldEnough(dateOfBirth: Date, minimumAge: number): boolean {
  const now = new Date();
  const cutoff = new Date(now.getFullYear() - minimumAge, now.getMonth(), now.getDate());
  return dateOfBirth <= cutoff;
}

function maxDateOfBirth(): string {
  const now = new Date();
  const year = now.getFullYear() - MINIMUM_AGE_YEARS;
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (!isOldEnough(new Date(dateOfBirth), MINIMUM_AGE_YEARS)) {
      setError(`You must be at least ${MINIMUM_AGE_YEARS} years old to create a Zero account.`);
      return;
    }

    setLoading(true);
    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
      dateOfBirth: new Date(dateOfBirth),
      callbackURL: "/onboarding",
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message ?? "Sign up failed. Please try again.");
      return;
    }

    setRegistered(true);
  }

  if (registered) {
    return (
      <div className="mt-8">
        <p className="text-sm text-ink">
          Account created! We&apos;ve sent you an email — open the link inside
          to confirm your address and activate your account.
        </p>
        <DevEmailLinkNotice email={email} kind="verify-email" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <Field
        label="Name"
        id="name"
        type="text"
        value={name}
        onChange={setName}
        autoComplete="name"
        required
      />
      <Field
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        required
      />
      <Field
        label="Date of birth"
        id="dateOfBirth"
        type="date"
        value={dateOfBirth}
        onChange={setDateOfBirth}
        autoComplete="bday"
        max={maxDateOfBirth()}
        required
      />
      <PasswordField
        id="password"
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        minLength={8}
        required
      />
      <PasswordField
        id="confirmPassword"
        label="Confirm password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        minLength={8}
        required
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Create account"}
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
  minLength?: number;
  max?: string;
};

function Field({
  label,
  id,
  type,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  max,
}: FieldProps) {
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
        minLength={minLength}
        max={max}
        className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
      />
    </div>
  );
}
