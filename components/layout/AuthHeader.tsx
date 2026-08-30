import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

/** Intestazione minimale per le pagine di autenticazione: solo il logo, niente menu. */
export function AuthHeader() {
  return (
    <Link href="/" aria-label="Zero home" className="inline-flex">
      <Logo className="h-7" />
    </Link>
  );
}
