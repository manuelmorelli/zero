import Link from "next/link";
import { FadeImage } from "@/components/common/FadeImage";
import { ShieldCheck, Play } from "lucide-react";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import { cn } from "@/lib/utils";

type ContentCardProps = {
  href: string;
  imageUrl: string | null;
  imageAlt: string;
  title: string;
  category?: string | null;
  /** Larghezza della card: fissa nelle righe a scorrimento laterale (es. "w-56 shrink-0
   * sm:w-72 lg:w-80"), assente nelle griglie che la calcolano da sole. */
  className?: string;
  /** Badge assoluto in alto a sinistra sulla foto, es. "Discovery"/"Archived". */
  status?: string;
  /** Journey Score (0-100, lib/scoring/journeyScore.ts): per i Journey è il proprio; per gli
   * episodi è quello del Journey a cui appartengono (non ne hanno uno proprio). Assente per
   * Journey ancora in Discovery Phase o per gli Update, che non ne hanno uno. Mostrato in basso
   * a destra sulla foto: l'icona compare sempre, il numero solo se maggiore di zero (un Journey
   * appena pubblicato può avere davvero 0, mostrarlo sembrerebbe un errore). */
  trust?: number;
  /** Menu/azioni in alto a destra sulla foto (solo proprietario del profilo): fuori dal <Link>
   * perché è un elemento interattivo (un bottone annidato in un link non è HTML valido). */
  menu?: React.ReactNode;
  /** Testo mostrato al centro al posto della foto quando `imageUrl` è null (es. i placeholder
   * motivazionali del feed demo). Se assente, l'area resta un semplice sfondo sfumato. */
  emptyMessage?: React.ReactNode;
  /** Mostra l'icona play sovrapposta alla foto: solo per le card che aprono un video (episodi),
   * non per i Journey (che non sono un contenuto riproducibile in sé). */
  isVideo?: boolean;
};

/** Card "poster" del Profilo: titolo/categoria/punteggio sovrapposti alla foto — stesso "poster
 * style" di JourneyCard/VideoCard/MomentJourneyCard. Il Like resta un elemento reale a sé, fuori
 * dal <Link>, sovrapposto in basso a destra (un bottone non può stare dentro un <a>). */
export function ContentCard({
  href,
  imageUrl,
  imageAlt,
  title,
  category,
  className,
  status,
  trust,
  menu,
  emptyMessage,
  isVideo,
}: ContentCardProps) {
  return (
    <div className={cn("group relative block transition-transform duration-300 hover:-translate-y-1", className)}>
      <Link
        href={href}
        className="relative block aspect-4/5 overflow-hidden rounded-xl border border-border shadow-[0_20px_40px_-22px_oklch(0.769_0.155_70.5_/_35%)] transition-[border-color,box-shadow] duration-300 group-hover:border-ember/40 group-hover:shadow-[0_20px_40px_-16px_rgba(226,145,77,0.5)]"
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
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-transparent" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_oklch(0.769_0.155_70.5_/_28%),_transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        {status && (
          <span className="absolute left-2.5 top-2.5 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            {status}
          </span>
        )}
        {category && <CategoryIcon category={category} className={status ? "absolute right-2.5 top-2.5" : "absolute left-2.5 top-2.5"} />}
        {isVideo && (
          <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-bg/60 backdrop-blur-md">
              <Play className="h-3.5 w-3.5 fill-current text-ember" aria-hidden="true" />
            </span>
          </span>
        )}

        <div className="absolute inset-x-0 bottom-[10%] p-3">
          {category && (
            <span className="inline-block rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              {category}
            </span>
          )}
          <h3 className="mt-2 truncate text-base font-semibold text-white transition-colors group-hover:text-ember">
            {title}
          </h3>
        </div>
        {trust !== undefined && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 text-xs font-bold text-ember">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {trust > 0 ? trust : null}
          </span>
        )}
      </Link>

      {menu && (
        <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
          {menu}
        </div>
      )}
    </div>
  );
}
