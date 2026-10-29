"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function AuthStatus() {
  const { data, isPending } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Il server non conosce mai la sessione: se il client ha già la sessione in cache,
    // la prima resa lato client rischia di non combaciare con quella dello stesso
    // istante sul server, un mismatch di hydration. Restare sullo scheletro fino a dopo
    // il mount garantisce che la primissima resa combaci sempre con quella del server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || isPending) {
    return <div className="h-9 w-24" />;
  }

  if (!data) {
    return (
      <>
        {/* md, non sm (640px): stesso confine telefono/computer del resto del sito (vedi la nota
         * in components/ui/cover-card.tsx) — a 640-768px (es. un telefono in orizzontale) questo
         * testo compariva mentre il resto dell'header era ancora in modalità telefono, finendo
         * addosso a campanella/messaggi/Ember (posizionati con max-md: proprio per quella fascia). */}
        <Link
          href="/login"
          className="hidden text-sm font-medium text-ink-muted hover:text-ink transition-colors md:block"
        >
          Sign in
        </Link>
        <Button variant="primary" href="/register" className="text-sm">
          Get Started
        </Button>
      </>
    );
  }

  return (
    <>
      <Link
        href={`/profile/${data.user.id}`}
        className="hidden text-sm font-medium text-ink-muted hover:text-ink transition-colors md:block"
      >
        Hi, {data.user.name}
      </Link>
    </>
  );
}
