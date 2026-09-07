import Link from "next/link";
import { FadeImage } from "@/components/common/FadeImage";
import { ShieldCheck } from "lucide-react";

type ContentCardProps = {
  href: string;
  imageUrl: string | null;
  imageAlt: string;
  title: string;
  category?: string | null;
  /** Badge assoluto in alto a sinistra sulla foto, es. "Discovery"/"Archived". */
  status?: string;
  /** Punteggio Journey Score (0-100): solo per i Journey, che sono l'unico contenuto con un
   * punteggio reale salvato (vedi lib/scoring/journeyScore.ts). Gli episodi/update non ne hanno
   * uno proprio: per quelli questa prop resta assente, niente numero inventato. */
  trust?: number;
  /** Il vero pulsante Like (interattivo): un elemento a sé, mai dentro il <Link> della card
   * (un bottone annidato in un link non è HTML valido). */
  likeSlot?: React.ReactNode;
  /** Menu/azioni in alto a destra sulla foto (solo proprietario del profilo): anche questo fuori
   * dal <Link> per lo stesso motivo. */
  menu?: React.ReactNode;
  /** Testo mostrato al centro al posto della foto quando `imageUrl` è null (es. i placeholder
   * motivazionali del feed demo). Se assente, l'area resta un semplice sfondo sfumato. */
  emptyMessage?: React.ReactNode;
};

/** Card "poster" del Profilo: foto sola sopra, titolo/categoria/punteggio sotto — stile diverso
 * da JourneyCard (usata in Home/Discover/Categorie/Ricerca, testo sovrapposto alla foto). Qui si
 * segue fedelmente ContentCard del sorgente Lovable (src/components/zero/Profile.tsx). */
export function ContentCard({
  href,
  imageUrl,
  imageAlt,
  title,
  category,
  status,
  trust,
  likeSlot,
  menu,
  emptyMessage,
}: ContentCardProps) {
  return (
    <div className="group relative block transition-transform duration-300 hover:-translate-y-1">
      <Link
        href={href}
        className="relative block aspect-4/5 overflow-hidden rounded-xl border border-border transition-[border-color,box-shadow] duration-300 group-hover:border-ember/40 group-hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]"
      >
        {imageUrl ? (
          <FadeImage
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : emptyMessage ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-2 via-surface-2 to-black p-4 text-center">
            {emptyMessage}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/70 to-transparent" />
        {status && (
          <span className="absolute left-2.5 top-2.5 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            {status}
          </span>
        )}
      </Link>

      {menu && (
        <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
          {menu}
        </div>
      )}

      <Link href={href} className="mt-2 block">
        <h3 className="truncate text-base font-semibold text-ink transition-colors group-hover:text-ember">
          {title}
        </h3>
      </Link>
      {category && (
        <p className="mt-0.5 text-[0.7rem] uppercase tracking-wider text-ink-faint">{category}</p>
      )}
      {(trust !== undefined || likeSlot) && (
        <div className="mt-1.5 flex items-center gap-3 text-[0.7rem] text-ink-muted">
          {trust !== undefined && (
            <span className="inline-flex items-center gap-1 text-ember">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {trust}
            </span>
          )}
          {likeSlot}
        </div>
      )}
    </div>
  );
}
