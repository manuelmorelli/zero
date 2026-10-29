import { cn } from "@/lib/utils";
import { CARD_ROW_ITEM } from "@/components/ui/cover-card";

/*
 * Sagoma di caricamento ufficiale (scelta di Manuel, punto D2 della lista design): un blocco
 * grigio al posto dello schermo bianco/vuoto mentre la pagina aspetta i dati dal database. Pulsa
 * piano e resta fermo nella forma, mai in scorrimento continuo (vedi docs/21_Motion_Guidelines.md).
 */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-surface-2", className)} />;
}

/** Riga di testo (titolo, paragrafo, etichetta). */
export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4 w-full", className)} />;
}

export type SkeletonCardFormat = "journey" | "episode" | "person";

const CARD_RATIO: Record<SkeletonCardFormat, string> = {
  journey: "aspect-4/5",
  episode: "aspect-4/3",
  person: "aspect-4/5 rounded-full",
};

/** Card con copertina: stesso formato di CoverFrame (components/ui/cover-card.tsx), così la
 * sagoma ha già la proporzione giusta per Journey, episodi o persone. */
export function SkeletonCard({
  format = "journey",
  className,
}: {
  format?: SkeletonCardFormat;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className={cn("w-full", CARD_RATIO[format])} />
      {format !== "person" && <SkeletonText className="h-4 w-3/4" />}
    </div>
  );
}

/** Griglia di card (Dashboard, Profilo): stessa densità di JourneyGrid/"Published Journeys",
 * due per riga anche sul telefono. */
export function SkeletonCardRow({
  count = 5,
  format = "journey",
}: {
  count?: number;
  format?: SkeletonCardFormat;
}) {
  return (
    // md, non sm: stesso confine telefono/computer del resto (vedi components/ui/cover-card.tsx),
    // così il placeholder di caricamento ha sempre la stessa densità della griglia vera sotto.
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} format={format} />
      ))}
    </div>
  );
}

/** Riga che scorre lateralmente (Home: Recommended, Latest Videos, Most Trusted...): stessa
 * larghezza fissa delle card vere in HorizontalScrollRow (CARD_ROW_ITEM), non una griglia — prima
 * usava la stessa sagoma a griglia di Dashboard/Profilo (2 colonne larghe), molto più grande delle
 * card vere a 112px fissi: un salto di misura visibile appena arrivavano i dati veri. */
export function SkeletonScrollRow({
  count = 5,
  format = "journey",
}: {
  count?: number;
  format?: Exclude<SkeletonCardFormat, "person">;
}) {
  return (
    <div className="flex items-start gap-4 overflow-x-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} format={format} className={CARD_ROW_ITEM[format]} />
      ))}
    </div>
  );
}
