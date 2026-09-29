import Link from "next/link";
import { FadeImage } from "@/components/common/FadeImage";
import { cn } from "@/lib/utils";

/*
 * Card con foto di copertina: formati ufficiali per tipo di contenuto (scelte di Manuel
 * 20C, 21A, 22A, 23A, 24A, 26A, 2026-09-29). Ogni card del sito con una copertina passa da
 * CoverFrame, e ogni griglia/riga di card usa CARD_GRID o CARD_ROW_ITEM dello stesso formato:
 * così una card ha sempre la stessa misura ovunque compaia.
 */

export type CoverFormat = "journey" | "episode" | "event" | "person" | "featured";

const RATIO: Record<CoverFormat, string> = {
  journey: "aspect-4/5",
  episode: "aspect-4/3",
  event: "aspect-video",
  person: "aspect-4/5",
  featured: "aspect-[16/10]",
};

/** Griglia: quante card per riga su telefono / tablet / computer. */
export const CARD_GRID: Record<Exclude<CoverFormat, "featured">, string> = {
  journey: "grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5",
  episode: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
  event: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
  // Le card persona sono piccole: due per riga anche sul telefono.
  person: "grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8",
};

/** Larghezza di una card dentro una riga che scorre (HorizontalScrollRow, gap-4): identica a
 * quella della griglia dello stesso formato, così la card non cambia misura tra pagine. */
export const CARD_ROW_ITEM: Record<Exclude<CoverFormat, "featured">, string> = {
  journey: "w-[80%] shrink-0 sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]",
  episode: "w-[80%] shrink-0 sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]",
  event: "w-[80%] shrink-0 sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]",
  person: "w-[42%] shrink-0 sm:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-7rem)/8)]",
};

const SIZES: Record<CoverFormat, string> = {
  journey: "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 100vw",
  episode: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  event: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  person: "(min-width: 1024px) 12vw, (min-width: 640px) 25vw, 50vw",
  featured: "(min-width: 1024px) 34vw, 100vw",
};

/** Copertina senza foto (scelta C14A): grigio che sfuma nel nero. */
export const COVER_PLACEHOLDER = "cover-placeholder";

type CoverFrameProps = {
  format: CoverFormat;
  href: string;
  imageUrl: string | null;
  imageAlt: string;
  /** Contenuto centrato quando manca la foto (es. le iniziali di una persona). */
  placeholder?: React.ReactNode;
  /** In alto a sinistra sulla foto (icona categoria, stato). */
  topLeft?: React.ReactNode;
  /** In alto a destra sulla foto (badge "Archived"...), dentro il link. */
  topRight?: React.ReactNode;
  /** Al centro della foto (icona play dei video). */
  center?: React.ReactNode;
  /** Testo sovrapposto in basso alla foto, su una sfumatura scura. */
  overlay?: React.ReactNode;
  /** Testo sotto la foto, fuori dall'immagine (card persona). */
  below?: React.ReactNode;
  /** Azioni del proprietario in alto a destra, FUORI dal link (un bottone non può stare in un <a>). */
  menu?: React.ReactNode;
  className?: string;
};

export function CoverFrame({
  format,
  href,
  imageUrl,
  imageAlt,
  placeholder,
  topLeft,
  topRight,
  center,
  overlay,
  below,
  menu,
  className,
}: CoverFrameProps) {
  return (
    <div className={cn("group relative transition-transform duration-300 hover:-translate-y-1", className)}>
      <Link href={href} className="block">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-border bg-surface-2 shadow-card transition-[border-color,box-shadow] duration-300 group-hover:border-ember-line group-hover:shadow-glow",
            RATIO[format]
          )}
        >
          {imageUrl ? (
            <FadeImage
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes={SIZES[format]}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className={cn("absolute inset-0 grid place-items-center p-4 text-center", COVER_PLACEHOLDER)}>
              {placeholder}
            </div>
          )}
          {overlay && <div className="card-scrim absolute inset-0" />}
          {topLeft && <div className="absolute left-2.5 top-2.5">{topLeft}</div>}
          {topRight && <div className="absolute right-2.5 top-2.5 z-10">{topRight}</div>}
          {center && <div className="absolute inset-0 grid place-items-center">{center}</div>}
          {overlay && <div className="absolute inset-x-0 bottom-0 p-3 text-on-photo">{overlay}</div>}
        </div>
        {below && <div className="mt-3">{below}</div>}
      </Link>
      {menu && (
        <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
          {menu}
        </div>
      )}
    </div>
  );
}

/** Etichetta sopra la foto (categoria, stato "Discovery"/"Archived"). */
export function CoverChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-block rounded-full bg-scrim px-2.5 py-1 text-sm font-semibold text-on-photo backdrop-blur-md", className)}>
      {children}
    </span>
  );
}

/** Titolo sopra la foto: bianco pieno, arancione al passaggio del mouse. */
export function CoverTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("truncate text-lg font-bold leading-tight text-on-photo transition-colors group-hover:text-ember", className)}>
      {children}
    </h3>
  );
}

/** Icona tonda "play" al centro delle card video. */
export function CoverPlay({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-12 w-12 place-items-center rounded-full bg-scrim text-ember backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
      {children}
    </span>
  );
}
