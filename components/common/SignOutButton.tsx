"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

type SignOutButtonProps = {
  className?: string;
  children?: ReactNode;
};

export function SignOutButton({ className, children }: SignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleSignOut} className={className}>
      {children ?? "Esci"}
    </button>
  );
}
