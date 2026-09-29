import Link from "next/link";
import Image from "next/image";
import { RsvpButton } from "@/components/profile/RsvpButton";
import { SectionTitle } from "@/components/ui/heading";

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
export function FreeEventsSection({ items, isLoggedIn }: { items: FreeEventItem[]; isLoggedIn: boolean }) {
  if (items.length === 0) return null;

  return (
    <section>
      <SectionTitle>Upcoming Free Events</SectionTitle>
      {/* Stessa griglia di OfferingSection (Shop/Workshop&Events a pagamento, poco più sotto in
          questa stessa pagina): card piccole e dense, mai una sola card che si allarga a metà
          riga quando c'è un solo evento (bug segnalato da Manuel il 2026-09-26). */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={`${item.kind}-${item.id}`}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface"
          >
            {/* Il pulsante Partecipo sotto è un elemento interattivo a sé: non va mai annidato
                dentro questo Link (bordo/annidamento <a> non validi rompono click e layout),
                stesso principio già seguito da JourneyGrid per il suo menu "···". */}
            <Link href={`/community/${item.kind}/${item.id}`} className="flex flex-1 flex-col">
              <div className="relative aspect-video bg-surface-2">
                {item.coverUrl ? (
                  <Image src={item.coverUrl} alt={item.title} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 cover-placeholder" />
                )}
                <span className="absolute right-2 top-2 rounded-full border border-ember-line bg-ember-soft px-2 py-0.5 text-sm font-bold uppercase tracking-wide text-ember backdrop-blur-md">
                  Free
                </span>
              </div>
              <div className="flex flex-1 flex-col p-3.5 pb-0">
                <p className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
                  {item.kind === "workshop" ? "Workshop" : "Event"}
                  {item.startsAt &&
                    ` · ${new Date(item.startsAt).toLocaleDateString(undefined, { dateStyle: "medium" })}`}
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug text-ink transition-colors hover:text-ember">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-muted">{item.description}</p>
                )}
              </div>
            </Link>
            <div className="mt-auto flex items-center justify-between gap-2 p-3.5 pt-3">
              <span className="truncate text-sm text-ink-faint">
                {item.rsvpCount} going
              </span>
              <RsvpButton kind={item.kind} id={item.id} initialGoing={item.going} isLoggedIn={isLoggedIn} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
