import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { BackButton } from "@/components/layout/BackButton";
import { cn } from "@/lib/utils";

/** Intestazione minimale per le pagine di autenticazione: solo il logo, niente menu.
 * `centerLogoOnMobile` (solo Registrazione, su richiesta di Manuel, 2026-11-03): la scritta
 * Zero va al centro esatto dello schermo su telefono, come nell'header principale del sito,
 * invece che incollata alla freccia indietro. Le altre pagine che usano questo componente
 * restano invariate di default. */
export function AuthHeader({ centerLogoOnMobile }: { centerLogoOnMobile?: boolean }) {
  return (
    <div className={cn("relative flex items-center gap-3", centerLogoOnMobile && "max-md:justify-center")}>
      <BackButton className={centerLogoOnMobile ? "max-md:absolute max-md:left-0" : undefined} />
      <Link href="/" aria-label="Zero home" className="inline-flex">
        <Logo className="h-7" />
      </Link>
    </div>
  );
}
