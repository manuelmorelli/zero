"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { SignOutButton } from "@/components/common/SignOutButton";

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
          className="hidden text-[15.5px] font-medium text-ink-muted hover:text-ink transition-colors sm:block"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-ink px-5 py-2.5 text-[15.5px] font-semibold text-bg hover:bg-ink-muted transition-colors"
        >
          Get Started
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href={`/profile/${data.user.id}`}
        className="hidden text-[15.5px] font-medium text-ink-muted hover:text-ink transition-colors sm:block"
      >
        Hi, {data.user.name}
      </Link>
      <SignOutButton className="rounded-full border border-border px-5 py-2.5 text-[15.5px] font-semibold text-ink hover:border-ink-muted transition-colors" />
    </>
  );
}
