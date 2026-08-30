import Link from "next/link";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-[0.72rem] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink"
    >
      ← {label}
    </Link>
  );
}
