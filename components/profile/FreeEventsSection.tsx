import { RsvpButton } from "@/components/profile/RsvpButton";
import { SectionTitle } from "@/components/ui/heading";
import { CARD_GRID, CoverChip, CoverFrame, CoverTitle } from "@/components/ui/cover-card";

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
export function FreeEventsSection({
  items,
  isLoggedIn,
  gridClassName = CARD_GRID.event,
}: {
  items: FreeEventItem[];
  isLoggedIn: boolean;
  /** Di base la griglia a pagina intera; la pagina Community passa una griglia più stretta
   * (COMMUNITY_CARD_GRID) perché qui questa sezione vive dentro mezza pagina, non tutta. */
  gridClassName?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <SectionTitle>Upcoming Free Events</SectionTitle>
      {/* Stesso formato "event" (fotografico, scritte sopra l'immagine) delle altre card del
          sito: mai una sola card che si allarga a metà riga quando c'è un solo evento (bug
          segnalato da Manuel il 2026-09-26). Il pulsante Partecipo sta fuori da CoverFrame (non
          annidato nel suo Link): bordo/annidamento <a> non validi rompono click e layout, stesso
          principio già seguito da JourneyGrid per il suo menu "···". */}
      <div className={`mt-4 ${gridClassName}`}>
        {items.map((item) => (
          <div key={`${item.kind}-${item.id}`} className="flex flex-col gap-2">
            <CoverFrame
              format="event"
              href={`/community/${item.kind}/${item.id}`}
              imageUrl={item.coverUrl}
              imageAlt={item.title}
              topRight={<CoverChip>Free</CoverChip>}
              overlay={
                <>
                  <CoverChip>
                    {item.kind === "workshop" ? "Workshop" : "Event"}
                    {item.startsAt &&
                      ` · ${new Date(item.startsAt).toLocaleDateString(undefined, { dateStyle: "medium" })}`}
                  </CoverChip>
                  <CoverTitle className="mt-2">{item.title}</CoverTitle>
                </>
              }
            />
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm text-ink-faint">{item.rsvpCount} going</span>
              <RsvpButton kind={item.kind} id={item.id} initialGoing={item.going} isLoggedIn={isLoggedIn} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
