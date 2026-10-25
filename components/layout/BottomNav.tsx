"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Plus, Search, CircleUserRound } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useQuickUpload } from "@/components/creator/QuickUploadButton";
import { PANEL } from "@/components/ui/panel";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { cn } from "@/lib/utils";

/**
 * Barra di navigazione in basso, solo sotto i 768px (md): su desktop questo file non rende nulla
 * di visibile (classe "hidden md:hidden" sempre nascosta lì), il resto del sito resta quindi
 * identico a prima. Monta in app/(site)/layout.tsx, quindi su ogni pagina con l'Header; le pagine
 * di autenticazione (login, registrazione, onboarding), che hanno un header diverso (AuthHeader),
 * sono fuori da quel layout e non la mostrano.
 *
 * Solo icone, senza etichette di testo: il design system non ammette testo sotto text-sm (vedi
 * scripts/check-design.mjs), troppo grande per 5 etichette affiancate su uno schermo da telefono;
 * un tab bar solo icone è anche più coerente con l'ispirazione dichiarata di Instagram (il suo
 * bottom nav non ha mai etichette) che con quella di Netflix/YouTube (che le usano).
 *
 * Il "+" centrale riusa lo stesso QuickUploadProvider del pulsante flottante globale
 * (components/creator/QuickUploadButton.tsx), nascosto su mobile per lasciare il posto a questo:
 * stessa azione, stesso modale, un solo punto di ingresso invece di due sullo schermo.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { data } = useSession();
  const quickUpload = useQuickUpload();
  const isLoggedIn = Boolean(data);
  // Stessa barra che si fa da parte di Header.tsx, qui verso il basso: più schermo al contenuto
  // mentre si scorre, torna appena si risale anche di poco.
  const hiddenOnScroll = useHideOnScroll();

  const isHome = pathname === "/";
  const isJourneys = pathname.startsWith("/journeys");
  const isSearch = pathname.startsWith("/search");
  const isProfile = pathname.startsWith("/profile");

  const profileHref = isLoggedIn ? `/profile/${data!.user.id}` : "/login";

  return (
    <nav
      aria-label="Primary"
      className={cn(
        PANEL,
        "fixed inset-x-6 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex items-center justify-around rounded-full p-2 transition-transform duration-300 md:hidden",
        hiddenOnScroll && "translate-y-24"
      )}
    >
      <NavTab href="/" label="Home" active={isHome}>
        <Home className="h-5 w-5" strokeWidth={1.75} />
      </NavTab>

      <NavTab href="/journeys" label="Journeys" active={isJourneys}>
        <Compass className="h-5 w-5" strokeWidth={1.75} />
      </NavTab>

      {quickUpload ? (
        <button
          type="button"
          onClick={() => quickUpload.openChoice()}
          aria-label="Add to your Journey or post an Update"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ember-line bg-ember-soft text-ember"
        >
          <Plus className="h-5 w-5" strokeWidth={2.25} />
        </button>
      ) : (
        <Link
          href="/login"
          aria-label="Sign in to create"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ember-line bg-ember-soft text-ember"
        >
          <Plus className="h-5 w-5" strokeWidth={2.25} />
        </Link>
      )}

      <NavTab href="/search" label="Search" active={isSearch}>
        <Search className="h-5 w-5" strokeWidth={1.75} />
      </NavTab>

      <NavTab href={profileHref} label="Profile" active={isProfile}>
        <CircleUserRound className="h-5 w-5" strokeWidth={1.75} />
      </NavTab>
    </nav>
  );
}

function NavTab({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn("grid h-11 w-11 shrink-0 place-items-center", active ? "text-ember" : "text-ink-faint")}
    >
      {children}
    </Link>
  );
}
