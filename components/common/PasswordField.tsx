"use client";

import { useId, useState } from "react";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  /** Contenuto accessorio accanto alla label, es. il link "Forgot password?" nel Login. */
  labelRight?: React.ReactNode;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
  required,
  labelRight,
}: PasswordFieldProps) {
  const uid = useId();
  const inputId = id || uid;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-muted">
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative mt-1.5">
        <input
          id={inputId}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-11 text-sm text-ink outline-none transition-colors focus:border-ink-muted"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-ink"
        >
          {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z"
      />
      <circle cx="10" cy="10" r="2.3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 2.5l15 15M8.3 8.4a2.3 2.3 0 0 0 3.3 3.3M6.2 6.3C3.8 7.6 1.5 10 1.5 10S4.5 16 10 16c1.4 0 2.6-.4 3.7-.9M15.6 13.7c1.8-1.5 2.9-3.7 2.9-3.7S15.5 4 10 4c-.5 0-1 0-1.5.1"
      />
    </svg>
  );
}
