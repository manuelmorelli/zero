"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { SignOutButton } from "@/components/common/SignOutButton";
import { loadFollowList } from "@/lib/actions/follow";
import type { FollowListPerson } from "@/lib/profile/followList";

type NavLink = { label: string; href: string };

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Discover", href: "/#discover" },
  { label: "Journeys", href: "/categories" },
  { label: "What is Zero", href: "/what-is-zero" },
  { label: "Pricing", href: "/pricing" },
];

const FOOTER_LINKS: NavLink[] = [
  { label: "About Zero", href: "/what-is-zero" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Contact us", href: "/contact" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Community Guidelines", href: "/community-guidelines" },
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

  const [following, setFollowing] = useState<FollowListPerson[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  useEffect(() => {
    // Il portale può montarsi solo lato client (document.body non esiste in SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !data) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingFollowing(true);
    loadFollowList("following", data.user.id).then((people) => {
      setFollowing(people);
      setLoadingFollowing(false);
    });
  }, [open, data]);

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
              className={`fixed inset-0 z-[60] bg-black/70 transition-opacity ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />
            <aside
              className={`fixed inset-y-0 left-0 z-[60] flex w-80 max-w-[85vw] flex-col overflow-y-auto border-r border-border bg-surface shadow-2xl shadow-black/50 transition-transform duration-300 ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
              aria-hidden={!open}
            >
              {isLoggedIn && (
                <MenuSection title="You">
                  <MenuLink href={`/profile/${data.user.id}`} onClick={close}>
                    Your profile
                  </MenuLink>
                  <MenuLink href="/dashboard" onClick={close}>
                    Dashboard
                  </MenuLink>
                  <MenuLink href="/settings" onClick={close}>
                    Settings
                  </MenuLink>
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

              {isLoggedIn && (
                <MenuSection title="Following">
                  {loadingFollowing ? (
                    <p className="px-3 py-2.5 text-sm text-ink-muted">Loading…</p>
                  ) : following.length === 0 ? (
                    <p className="px-3 py-2.5 text-sm text-ink-muted">
                      You&apos;re not following anyone yet.
                    </p>
                  ) : (
                    following.map((person) => (
                      <Link
                        key={person.id}
                        href={`/profile/${person.username ?? person.id}`}
                        onClick={close}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-2"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-xs font-semibold text-ink-muted">
                          {person.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={person.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            person.name.charAt(0).toUpperCase()
                          )}
                        </span>
                        <span className="min-w-0 truncate text-sm text-ink">{person.name}</span>
                      </Link>
                    ))
                  )}
                </MenuSection>
              )}

              <div className="mt-auto space-y-3 border-t border-border px-5 py-5">
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {FOOTER_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={close}
                      className="text-xs text-ink-faint transition-colors hover:text-ink-muted"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <p className="text-xs text-ink-faint">© {new Date().getFullYear()} Zero</p>
              </div>
            </aside>
          </>,
          document.body
        )}
    </>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border px-3 py-4">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">{title}</p>
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
