"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type NavLink = { label: string; href: string };

/**
 * Menu ad hamburger per smartphone: mostra i link di navigazione che in Header
 * sono nascosti sotto la breakpoint `md` (Discover, Journeys, What is Zero, Pricing).
 */
export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Chiudi menu" : "Apri menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-ink"
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

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-surface p-2 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
