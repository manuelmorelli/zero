import type { LucideIcon } from "lucide-react";
import { CoverChip, CoverFrame, CoverTitle } from "@/components/ui/cover-card";

/** Card fotografica condivisa da ogni griglia della pagina Community (Shop, Workshop & Eventi,
 * 1:1 Consulting, Forum): stessa card ufficiale già usata per gli Eventi gratuiti (`CoverFrame`),
 * non più un riquadro fatto a parte per sezione (richiesto da Manuel, 2026-10-03 — "le stesse card
 * che hai utilizzato per gli eventi"). `footer` sta fuori da `CoverFrame`/`Link` apposta: un bottone
 * reale non può stare annidato in un `<a>`, stesso principio di `FreeEventsSection`. */
export function ListingCard({
  href,
  coverUrl,
  icon: Icon,
  chipLabel,
  title,
  footer,
}: {
  href: string;
  coverUrl: string | null;
  icon: LucideIcon;
  chipLabel: string;
  title: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <CoverFrame
        format="event"
        href={href}
        imageUrl={coverUrl}
        imageAlt={title}
        placeholder={<Icon className="h-8 w-8 text-ink-faint" aria-hidden="true" />}
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
