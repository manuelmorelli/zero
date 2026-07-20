"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { SignOutButton } from "@/components/common/SignOutButton";

export function AuthStatus() {
  const { data, isPending } = useSession();

  if (isPending) {
    return <div className="h-9 w-24" />;
  }

  if (!data) {
    return (
      <>
        <Link
          href="/login"
          className="hidden text-sm font-medium text-ink-muted hover:text-ink transition-colors sm:block"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg hover:bg-ink-muted transition-colors"
        >
          Start now
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/account"
        className="hidden text-sm font-medium text-ink-muted hover:text-ink transition-colors sm:block"
      >
        Ciao, {data.user.name}
      </Link>
      <SignOutButton className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink-muted transition-colors" />
    </>
  );
}
