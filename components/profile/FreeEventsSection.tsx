import Link from "next/link";
import Image from "next/image";
import { RsvpButton } from "@/components/profile/RsvpButton";

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
      <h2 className="text-base font-bold tracking-tight">Upcoming free events</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={`${item.kind}-${item.id}`} className="overflow-hidden rounded-xl border border-border bg-surface">
            <Link href={`/community/${item.kind}/${item.id}`} className="relative block aspect-video bg-surface-2">
              {item.coverUrl ? (
                <Image src={item.coverUrl} alt={item.title} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
              )}
              <span className="absolute right-2 top-2 rounded-full border border-ember/20 bg-gradient-to-b from-ember/15 to-white/[0.02] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-emerald-500 backdrop-blur-md">
                Free
              </span>
            </Link>
            <div className="p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ember">
                {item.kind === "workshop" ? "Workshop" : "Event"}
              </p>
              <Link href={`/community/${item.kind}/${item.id}`}>
                <p className="mt-1 text-sm font-semibold text-ink hover:text-ember">{item.title}</p>
              </Link>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">{item.description}</p>
              )}
              {item.startsAt && (
                <p className="mt-2 text-xs text-ink-muted">
                  {new Date(item.startsAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-ink-faint">
                  {item.rsvpCount} {item.rsvpCount === 1 ? "person" : "people"} going
                </span>
                <RsvpButton kind={item.kind} id={item.id} initialGoing={item.going} isLoggedIn={isLoggedIn} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
