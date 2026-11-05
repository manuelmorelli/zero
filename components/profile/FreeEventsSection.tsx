import { SectionTitle } from "@/components/ui/heading";
import { CARD_GRID, CoverChip, CoverFrame, CoverTitle } from "@/components/ui/cover-card";
import { CommunityListingMenu } from "@/components/creator/CommunityListingMenu";
import { cn } from "@/lib/utils";

export type FreeEventItem = {
  kind: "workshop" | "event";
  id: string;
  title: string;
  description: string | null;
  startsAt: string | null;
  coverUrl: string | null;
  going: boolean;
  rsvpCount: number;
};

/** Sul profilo pubblico, non dentro Community (Punto 8 dell'allineamento, 2026-09-25, richiesto da
 * Manuel): un'iniziativa gratuita è contenuto pubblico come i Journey, non un'offerta a pagamento —
 * compare solo se il creator ne ha pubblicata almeno una, altrimenti la sezione non si mostra.
 * Riusata anche nella pagina Community stessa (2026-09-26), dove diventa l'elenco completo. */
export function FreeEventsSection({ items, isOwner = false }: { items: FreeEventItem[]; isOwner?: boolean }) {
  if (items.length === 0) return null;

  return (
    <section>
      <SectionTitle className="max-md:text-xl">Upcoming Activities</SectionTitle>
      {/* Stesso formato "event" (fotografico, scritte sopra l'immagine) delle altre card del
          sito: mai una sola card che si allarga a metà riga quando c'è un solo evento (bug
          segnalato da Manuel il 2026-09-26). Il pulsante Partecipo sta fuori da CoverFrame (non
          annidato nel suo Link): bordo/annidamento <a> non validi rompono click e layout, stesso
          principio già seguito da JourneyGrid per il suo menu "···". */}
      <div className={cn("mt-4", CARD_GRID.event, "max-md:grid-cols-[repeat(auto-fill,140px)]")}>
        {items.map((item) => {
          const kindLabel = item.kind === "workshop" ? "Workshop" : "Activity";
          const dateLabel = item.startsAt
            ? new Date(item.startsAt).toLocaleDateString(undefined, { dateStyle: "medium" })
            : null;
          return (
            <div key={`${item.kind}-${item.id}`} className="flex flex-col gap-2">
              <CoverFrame
                format="event"
                href={`/community/${item.kind}/${item.id}`}
                imageUrl={item.coverUrl}
                imageAlt={item.title}
                frameClassName="max-md:border-ember-line"
                menu={
                  isOwner ? (
                    <CommunityListingMenu listingId={item.id} listingType={item.kind} title={item.title} status="ACTIVE" />
                  ) : undefined
                }
                // Titolo in alto a sinistra (su mobile era già così, ora anche da desktop,
                // richiesto da Manuel il 2026-11-04): Free scende in basso a destra su mobile,
                // resta in alto a destra da desktop. In basso sulla sfumatura resta solo il tipo/data.
                topLeft={<CoverTitle className="max-w-[60%]">{item.title}</CoverTitle>}
                // La sfumatura sulla foto resta solo su mobile: il badge "Free" ha già il suo
                // sfondo (CoverChip, bg-scrim) e si legge bene anche senza.
                scrimClassName="md:hidden"
                overlay={
                  <>
                    <div className="flex translate-y-2 justify-end md:hidden">
                      <CoverChip className="max-md:border max-md:border-ember-line max-md:bg-overlay-soft max-md:py-0.5">Free</CoverChip>
                    </div>
                    {/* Da desktop in su (richiesto da Manuel, 2026-11-04): "Free" scende in
                     * basso a destra sulla foto, non più in alto a destra. */}
                    <div className="hidden justify-end md:flex">
                      <CoverChip>Free</CoverChip>
                    </div>
                  </>
                }
                below={
                  <span className="block truncate text-sm text-ink-faint">
                    {kindLabel}
                    {dateLabel && ` · ${dateLabel}`}
                  </span>
                }
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
