"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { AuthStatus } from "@/components/layout/AuthStatus";
import { SearchIcon } from "@/components/search/SearchForm";

const NAV_LINKS = [
  { label: "Discover", href: "/categories" },
  { label: "Journeys", href: "/#journey" },
  { label: "What is Zero", href: "/what-is-zero" },
  { label: "Pricing", href: "/pricing" },
];

/**
 * Header unico di tutto il sito (Home, Journey, Player, Profilo, Dashboard, What is Zero).
 * A differenza del design di riferimento (che mostra sempre "Sign In / Get Started", essendo
 * un mockup statico), qui a destra c'è sempre AuthStatus vero: mostra login/registrazione a un
 * visitatore senza account, nome + logout a chi è loggato, su ogni pagina indistintamente.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-border bg-bg/40 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-2 md:grid-cols-[1fr_auto_1fr] md:px-8">
        <Link href="/" className="flex min-w-0 items-center" aria-label="Zero home">
          <Logo className="h-7" />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-4">
          <Link
            href="/search"
            aria-label="Search"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            <SearchIcon className="h-4 w-4" />
          </Link>
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
