import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { BackButton } from "@/components/layout/BackButton";

/** Intestazione minimale per le pagine di autenticazione: solo il logo, niente menu. */
export function AuthHeader() {
  return (
    <div className="flex items-center gap-3">
      <BackButton />
      <Link href="/" aria-label="Zero home" className="inline-flex">
        <Logo className="h-7" />
      </Link>
    </div>
  );
}
