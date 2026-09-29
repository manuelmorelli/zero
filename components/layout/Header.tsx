"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { AuthStatus } from "@/components/layout/AuthStatus";
import { BackButton } from "@/components/layout/BackButton";
import { SideMenu } from "@/components/layout/SideMenu";
import { SearchIcon } from "@/components/search/SearchForm";
import { PAGE_WIDTH } from "@/components/ui/page-container";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Journeys", href: "/journeys" },
  { label: "Journeyers", href: "/journeyers" },
  { label: "What is Zero", href: "/what-is-zero" },
  { label: "Algorithm", href: "/how-it-works" },
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
      className={`fixed inset-x-0 top-0 z-50 border-b border-border bg-glass backdrop-blur-md transition-colors duration-300 ${
        scrolled ? "bg-glass-strong" : ""
      }`}
    >
      <div className={cn(PAGE_WIDTH.wide, "grid h-[3.85rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]")}>
        <div className="-ml-5 flex min-w-0 items-center gap-3 md:-ml-8">
          <SideMenu />
          <BackButton />
          <Link href="/" className="flex min-w-0 items-center" aria-label="Zero home">
            <Logo className="h-7" />
          </Link>
        </div>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-ink transition-colors hover:text-ember"
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
            <SearchIcon className="h-[18px] w-[18px]" />
          </Link>
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
