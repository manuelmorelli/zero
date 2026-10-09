import Link from "next/link";
import { PageTitle, SectionTitle } from "@/components/ui/heading";
import { BUTTON_VARIANTS } from "@/components/ui/button";

/** Intestazione di una riga ("Discovering Now", "Top Journeys", ecc.): icona + titolo + sottotitolo + "View all".
 * Con `page` fa da intestazione di una pagina intera (es. /discover/now) e usa il titolo di pagina. */
export function SectionHeading({
  icon,
  title,
  titleHref,
  subtitle,
  viewAllHref,
  page,
}: {
  icon?: React.ReactNode;
  title: string;
  /** Rende il titolo stesso un link (es. categoria -> pagina dedicata), al posto di "View All". */
  titleHref?: string;
  subtitle?: string;
  viewAllHref?: string;
  page?: boolean;
}) {
  const Title = page ? PageTitle : SectionTitle;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {icon && <span className="mt-0.5 shrink-0 text-ember">{icon}</span>}
        <div className="min-w-0">
          {titleHref ? (
            <Link href={titleHref} className="group">
              <Title className="truncate transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-ember">{title}</Title>
            </Link>
          ) : (
            <Title className="truncate">{title}</Title>
          )}
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className={`${BUTTON_VARIANTS.text} shrink-0`}>
          View All
        </Link>
      )}
    </div>
  );
}
