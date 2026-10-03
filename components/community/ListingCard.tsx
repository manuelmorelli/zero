import type { LucideIcon } from "lucide-react";
import { CoverChip, CoverFrame, CoverTitle } from "@/components/ui/cover-card";

/** Card fotografica condivisa da ogni riga della Community (pagina visitatore e Dashboard): stessa
 * card ufficiale già usata per gli Eventi gratuiti (`CoverFrame`). `footer` e `menu` stanno fuori da
 * `CoverFrame`/`Link` apposta: un bottone reale non può stare annidato in un `<a>`, stesso principio
 * di `FreeEventsSection`. `menu` è il menu del proprietario (es. i tre puntini in Dashboard). */
export function ListingCard({
  href,
  coverUrl,
  icon: Icon,
  chipLabel,
  title,
  footer,
  menu,
}: {
  href: string;
  coverUrl: string | null;
  icon: LucideIcon;
  chipLabel: string;
  title: string;
  footer?: React.ReactNode;
  menu?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <CoverFrame
        format="event"
        href={href}
        imageUrl={coverUrl}
        imageAlt={title}
        placeholder={<Icon className="h-8 w-8 text-ink-faint" aria-hidden="true" />}
        menu={menu}
        overlay={
          <>
            <CoverChip>{chipLabel}</CoverChip>
            <CoverTitle className="mt-2">{title}</CoverTitle>
          </>
        }
      />
      {footer}
    </div>
  );
}
