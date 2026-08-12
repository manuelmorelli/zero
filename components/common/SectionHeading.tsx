import Link from "next/link";

/** Intestazione di una riga Home ("Discovering Now", "Top Journeys", ecc.): icona + titolo + sottotitolo + "View all". */
export function SectionHeading({
  icon,
  title,
  subtitle,
  viewAllHref,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  viewAllHref?: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 shrink-0 text-ember">{icon}</span>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        </div>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ember"
        >
          View all
          <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
        </Link>
      )}
    </div>
  );
}
