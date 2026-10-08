"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AiMascotButton } from "@/components/common/AiMascotButton";
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
        <Link
          href="/login"
          className="hidden text-sm font-medium text-ink-muted hover:text-ink transition-colors sm:block"
        >
          Sign in
        </Link>
        <Button variant="primary" href="/register" className="text-sm">
          Get Started
        </Button>
        <AiMascotButton />
      </>
    );
  }

  return (
    <>
      <Link
        href={`/profile/${data.user.id}`}
        className="hidden text-sm font-medium text-ink-muted hover:text-ink transition-colors sm:block"
      >
        Hi, {data.user.name}
      </Link>
      {/* "Sign out" tolto da qui (2026-10-09): è già raggiungibile dal menu laterale
          (SideMenu.tsx, sezione "You"), nessuna funzione persa. Al suo posto, l'assistente AI. */}
      <AiMascotButton />
    </>
  );
}
