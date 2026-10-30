"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Home,
  Compass,
  Users,
  Info,
  BarChart3,
  Tag,
  ShieldCheck,
  UserRound,
  LayoutDashboard,
  Megaphone,
  Settings as SettingsIcon,
  Flag,
  LogOut,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { SignOutButton } from "@/components/common/SignOutButton";
import { isCurrentUserAdmin } from "@/lib/actions/adminReports";
import { Avatar } from "@/components/ui/avatar";

type NavLink = { label: string; href: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> };

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Journeys", href: "/journeys", icon: Compass },
  { label: "Journeyers", href: "/journeyers", icon: Users },
  { label: "What is Zero", href: "/what-is-zero", icon: Info },
  { label: "How It Works", href: "/how-it-works", icon: BarChart3 },
  { label: "Pricing", href: "/pricing", icon: Tag },
  { label: "Community Guidelines", href: "/community-guidelines", icon: ShieldCheck },
];

const ACCOUNT_LINKS = (userId: string): NavLink[] => [
  { label: "Your Profile", href: `/profile/${userId}`, icon: UserRound },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Community", href: "/dashboard/community/new", icon: Megaphone },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

type FooterLink = { label: string; href: string };

const FOOTER_LINKS: FooterLink[] = [
  { label: "About Zero", href: "/what-is-zero" },
  { label: "Contact us", href: "/contact" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Copyright & Report content", href: "/copyright" },
];

/**
 * Pannello laterale a scomparsa da sinistra: menu completo del sito (mobile e desktop), affianca
 * la barra di navigazione orizzontale dell'Header senza sostituirla. Sostituisce il vecchio
 * `MobileNav` (mini-tendina di soli 4 link, solo mobile): stessa icona hamburger riusata, ma ora
 * sempre visibile e con contenuto molto più ampio.
 */
export function SideMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data } = useSession();
  const isLoggedIn = !!data;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!open || !isLoggedIn) return;
    isCurrentUserAdmin().then(setIsAdmin);
  }, [open, isLoggedIn]);

  useEffect(() => {
    // Il portale può montarsi solo lato client (document.body non esiste in SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center text-ink-muted transition-colors hover:text-ink"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {mounted &&
        createPortal(
          <>
            <div
              onClick={close}
              className={`fixed inset-0 z-[60] bg-scrim transition-opacity ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />
            <aside
              className={`fixed inset-y-0 left-0 z-[60] flex w-80 max-w-[85vw] flex-col overflow-y-auto border-r border-border bg-surface shadow-2xl  transition-transform duration-300 ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
              aria-hidden={!open}
            >
              <div className="flex justify-end px-3 pt-3">
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Sotto i 768px: un'unica lista con icone, foto+nome in cima, niente titoli di
                  sezione MAIUSCOLI — identico al menu del mockup. Da tablet in su invariato: le
                  due sezioni "You"/"Navigate" con titolo, senza icone, di prima. */}
              <div className="flex flex-1 flex-col md:hidden">
                {isLoggedIn && (
                  <Link
                    href={`/profile/${data.user.id}`}
                    onClick={close}
                    className="flex items-center gap-3 border-b border-border px-5 py-4 transition-colors hover:bg-surface-2"
                  >
                    {/* Niente avatarUrl: data.user.image della sessione è la chiave di
                        archiviazione (R2), non un link vero alla foto — serve risolverla lato
                        server (vedi getImagePlaybackUrl, come fa ProfileHero), qui bastano le
                        iniziali, come nel mockup. */}
                    <Avatar name={data.user.name} size="sm" />
                    <span>
                      <span className="block text-sm font-semibold text-ink">{data.user.name}</span>
                      <span className="block text-sm text-ember">View profile</span>
                    </span>
                  </Link>
                )}

                <div className="flex flex-col px-3 py-3">
                  {NAV_LINKS.map((link) => (
                    <MobileMenuLink key={link.label} link={link} onClick={close} />
                  ))}
                </div>

                {isLoggedIn && (
                  <div className="flex flex-col border-t border-border px-3 py-3">
                    {ACCOUNT_LINKS(data.user.id).map((link) => (
                      <MobileMenuLink key={link.label} link={link} onClick={close} />
                    ))}
                    {isAdmin && <MobileMenuLink link={{ label: "Reports", href: "/admin/reports", icon: Flag }} onClick={close} />}
                  </div>
                )}

                {isLoggedIn && (
                  <div className="border-t border-border px-3 py-3">
                    <SignOutButton className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-danger transition-colors hover:bg-surface-2">
                      <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      Sign out
                    </SignOutButton>
                  </div>
                )}
              </div>

              {/* Da 768px in su: struttura invariata (due sezioni con titolo, senza icone). */}
              <div className="hidden md:flex md:flex-1 md:flex-col">
                {isLoggedIn && (
                  <MenuSection title="You">
                    <MenuLink href={`/profile/${data.user.id}`} onClick={close}>
                      Your Profile
                    </MenuLink>
                    <MenuLink href="/dashboard" onClick={close}>
                      Dashboard
                    </MenuLink>
                    <MenuLink href="/dashboard/community/new" onClick={close}>
                      Community
                    </MenuLink>
                    <MenuLink href="/settings" onClick={close}>
                      Settings
                    </MenuLink>
                    {isAdmin && (
                      <MenuLink href="/admin/reports" onClick={close}>
                        Reports
                      </MenuLink>
                    )}
                    <SignOutButton className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink">
                      Sign out
                    </SignOutButton>
                  </MenuSection>
                )}

                <MenuSection title="Navigate">
                  {NAV_LINKS.map((link) => (
                    <MenuLink key={link.label} href={link.href} onClick={close}>
                      {link.label}
                    </MenuLink>
                  ))}
                </MenuSection>
              </div>

              <div className="mt-auto space-y-3 border-t border-border px-5 py-5">
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {FOOTER_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={close}
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <p className="text-sm text-ink-faint">© {new Date().getFullYear()} Zero</p>
              </div>
            </aside>
          </>,
          document.body
        )}
    </>
  );
}

function MobileMenuLink({ link, onClick }: { link: NavLink; onClick: () => void }) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink transition-colors hover:bg-surface-2"
    >
      <Icon className="h-[18px] w-[18px] shrink-0 text-ink-muted" strokeWidth={1.75} />
      {link.label}
    </Link>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border px-3 py-4">
      <p className="px-3 pb-2 text-sm font-semibold uppercase tracking-wide text-ink-faint">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-lg px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {children}
    </Link>
  );
}
