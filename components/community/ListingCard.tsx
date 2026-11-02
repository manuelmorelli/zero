import type { LucideIcon } from "lucide-react";
import { CoverChip, CoverFrame, CoverTitle } from "@/components/ui/cover-card";
import { cn } from "@/lib/utils";

/** Card fotografica condivisa da ogni riga della Community (pagina visitatore e Dashboard): stessa
 * card ufficiale già usata per gli Eventi gratuiti (`CoverFrame`). `footer` e `menu` stanno fuori da
 * `CoverFrame`/`Link` apposta: un bottone reale non può stare annidato in un `<a>`, stesso principio
 * di `FreeEventsSection`. `menu` è il menu del proprietario (es. i tre puntini in Dashboard). */
export function ListingCard({
  href,
  coverUrl,
  icon: Icon,
  chipLabel,
  badgeLabel,
  topRight,
  titleClassName,
  title,
  footer,
  menu,
}: {
  href: string;
  coverUrl: string | null;
  icon: LucideIcon;
  chipLabel: string;
  /** Etichetta breve ("Free"...) per la pillola in basso a destra solo mobile, stesso trattamento
   * delle card Activities (titolo sopra la foto, pillola di vetro). Senza, su mobile resta il
   * vecchio stile (chipLabel+titolo impilati in basso), invariato. */
  badgeLabel?: string;
  /** Contenuto in alto a destra sulla foto (es. pillola di stato Draft/Published in Dashboard). */
  topRight?: React.ReactNode;
  /** Scarto facoltativo sul titolo in alto a sinistra (es. abbassarlo solo in una pagina), senza
   * toccare le altre pagine che usano badgeLabel. */
  titleClassName?: string;
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
        topRight={topRight}
        frameClassName={badgeLabel ? "max-md:border-ember-line" : undefined}
        topLeft={
          badgeLabel ? (
            <CoverTitle className={cn("hidden max-w-[80%] max-md:block", titleClassName)}>{title}</CoverTitle>
          ) : undefined
        }
        overlay={
          badgeLabel ? (
            <>
              <div className="hidden md:block">
                <CoverChip>{chipLabel}</CoverChip>
                <CoverTitle className="mt-2">{title}</CoverTitle>
              </div>
              <div className="flex justify-end md:hidden">
                <CoverChip className="max-md:border max-md:border-ember-line max-md:bg-overlay-soft max-md:py-0.5">
                  {badgeLabel}
                </CoverChip>
              </div>
            </>
          ) : (
            <>
              <CoverChip>{chipLabel}</CoverChip>
              <CoverTitle className="mt-2">{title}</CoverTitle>
            </>
          )
        }
      />
      {footer}
    </div>
  );
}
