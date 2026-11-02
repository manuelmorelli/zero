import Link from "next/link";
import { PageTitle, SectionTitle } from "@/components/ui/heading";
import { BUTTON_VARIANTS } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Intestazione di una riga ("Discovering Now", "Most Trusted", ecc.): icona + titolo + sottotitolo + "View all".
 * Con `page` fa da intestazione di una pagina intera (es. /discover/now) e usa il titolo di pagina. */
export function SectionHeading({
  icon,
  title,
  titleHref,
  subtitle,
  viewAllHref,
  page,
  titleClassName,
}: {
  icon?: React.ReactNode;
  title: string;
  /** Rende il titolo stesso un link (es. categoria -> pagina dedicata), al posto di "View All". */
  titleHref?: string;
  subtitle?: string;
  viewAllHref?: string;
  page?: boolean;
  /** Scarto facoltativo rispetto alla grandezza di default (es. più grande solo su mobile su una
   * pagina specifica), senza toccare SectionTitle/PageTitle per tutto il sito. */
  titleClassName?: string;
}) {
  const Title = page ? PageTitle : SectionTitle;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {icon && <span className="mt-0.5 shrink-0 text-ember">{icon}</span>}
        <div className="min-w-0">
          {titleHref ? (
            <Link href={titleHref} className="group">
              <Title className={cn("truncate transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-ember", titleClassName)}>{title}</Title>
            </Link>
          ) : (
            <Title className={cn("truncate", titleClassName)}>{title}</Title>
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
