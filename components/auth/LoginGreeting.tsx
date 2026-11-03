"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/heading";
import { readKnownUser } from "@/lib/knownUser";

/** Titolo della pagina di Sign in: se questo browser ha già avuto una sessione valida, saluta
 * la persona per nome invece del generico "Welcome Back" (richiesta di Manuel, 2026-11-03). */
export function LoginGreeting() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(readKnownUser()?.name ?? null);
  }, []);

  return (
    <>
      <PageTitle className="mt-8">{name ? `Welcome Back, ${name}` : "Welcome Back"}</PageTitle>
      <p className="mt-2 text-sm text-ink-muted">Sign in to continue your Journey.</p>
    </>
  );
}
