import Link from "next/link";
import { FadeImage } from "@/components/common/FadeImage";
import { cn } from "@/lib/utils";
import { COVER_IMAGE_QUALITY } from "@/lib/constants/image";

/*
 * Card con foto di copertina: formati ufficiali per tipo di contenuto (scelte di Manuel
 * 20C, 21A, 22A, 23A, 24A, 26A, 2026-09-29). Ogni card del sito con una copertina passa da
 * CoverFrame, e ogni griglia/riga di card usa CARD_GRID o CARD_ROW_ITEM dello stesso formato:
 * così una card ha sempre la stessa misura ovunque compaia.
 */

export type CoverFormat = "journey" | "episode" | "event" | "person" | "featured";

// Stessa identica proporzione per event/person (112x156 nel mockup, ContinueCard.dc.html e
// PosterCard.dc.html), su richiesta esplicita di Manuel, 2026-10-29: card di forma diversa tra
// loro nella stessa pagina non erano accettabili. "featured" resta diversa: è una card singola
// in bella mostra, non una riga.
const ROW_RATIO = "aspect-[112/156]";
// Journey/episode passano a 16:9 (2026-11-09, scelta di Manuel): stesso formato dei video di
// YouTube, per rendere facile a un creator che arriva da lì portare le sue copertine su Zero.
// Esplicitamente ESCLUSE da questo cambio: la card del video di presentazione (player a parte),
// le copertine di eventi/Activities ed event/person qui sotto, e le card persona/wildcard.
const VIDEO_RATIO = "aspect-video";
const RATIO: Record<CoverFormat, string> = {
  journey: VIDEO_RATIO,
  episode: VIDEO_RATIO,
  // Stessa forma verticale ovunque (2026-11-03): il ritaglio al caricamento (CommunityListingForm)
  // è ora 112/156, quindi la foto scelta dalla persona va bene al primo colpo sia su telefono
  // che su computer, senza bisogno di un secondo ritaglio dedicato al computer.
  event: ROW_RATIO,
  person: ROW_RATIO,
  featured: "aspect-[16/10]",
};

/** Griglia: quante card per riga su telefono / tablet / computer. Due per riga anche sul
 * telefono (prima una sola, a piena larghezza: troppo grande, lontano dalla densità del mockup
 * mobile — da tablet in su invariato). Il cambio di densità scatta a 768px (md), non più a 640px
 * (sm): il resto del porting mobile (Header, BottomNav, Hero) passa dalla modalità telefono a
 * quella computer esattamente a 768px — tra 640 e 768px (un telefono in orizzontale, per esempio)
 * si vedeva un mix: barra/header ancora da telefono ma card già nella densità da tablet/computer. */
// Sul telefono colonne a larghezza fissa (112px, come le card nelle righe — stesso motivo:
// niente colonne che si allargano ruotando lo schermo). Da tablet in su invariate (colonne
// fluide, numero fisso per riga).
// Journey/episode (16:9) una sola card per riga sul telefono (larghezza piena, non più 112px
// fissi: troppo piccola per un formato orizzontale), 2 a tablet e 3 a computer, come nelle
// righe a scorrimento (CARD_ROW_ITEM, stessa larghezza finale).
const VIDEO_GRID = "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3";
export const CARD_GRID: Record<Exclude<CoverFormat, "featured">, string> = {
  journey: VIDEO_GRID,
  episode: VIDEO_GRID,
  // Da tablet in su stesse dimensioni delle copertine di Recent Episodes sul profilo
  // personale (CARD_ROW_ITEM.episode, 3 colonne a md e 5 a lg con lo stesso gap-4):
  // qui la riga equivalente in griglia, non a scorrimento (Manuel, 2026-11-04).
  event: "grid grid-cols-[repeat(auto-fill,112px)] gap-4 md:grid-cols-3 lg:grid-cols-5",
  // Le card persona sono piccole: due per riga anche sul telefono.
  person: "grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8",
};

/** Larghezza di una card dentro una riga che scorre (HorizontalScrollRow, gap-4): identica a
 * quella della griglia dello stesso formato, così la card non cambia misura tra pagine. Sul
 * telefono, 46.2% (prima 42%, +10% su richiesta di Manuel, 2026-10-29: ancora troppo piccole nel
 * confronto con il mockup). Da tablet in su invariato (fluida, come prima). */
// Journey/episode (16:9) sono più larghe delle altre card verticali, altrimenti la stessa
// percentuale le farebbe uscire come una striscia sottile (misura già vista e approvata da
// Manuel nel test su Home, 2026-11-09).
const VIDEO_ROW_ITEM = "w-[78%] shrink-0 md:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]";
export const CARD_ROW_ITEM: Record<Exclude<CoverFormat, "featured">, string> = {
  journey: VIDEO_ROW_ITEM,
  episode: VIDEO_ROW_ITEM,
  event: "w-[46.2%] shrink-0 md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]",
  person: "w-[46.2%] shrink-0 md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-7rem)/8)]",
};

/** Card delle Activities (Upcoming Activities, righe Activities di Community): da computer larghe
 * 2/3 di CARD_ROW_ITEM.event, stesse proporzioni; telefono invariato (Manuel, 2026-11-12). */
export const ACTIVITY_ROW_ITEM =
  "w-[46.2%] shrink-0 md:w-[calc((100%-2rem)/3*2/3)] lg:w-[calc((100%-4rem)/5*2/3)]";

const SIZES: Record<CoverFormat, string> = {
  journey: "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 78vw",
  episode: "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 78vw",
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
  /** Scarto facoltativo sul contenitore di `below` (es. mostrarlo solo da computer). */
  belowClassName?: string;
  /** Azioni del proprietario in alto a destra, FUORI dal link (un bottone non può stare in un <a>). */
  menu?: React.ReactNode;
  className?: string;
  /** Scarto facoltativo sul riquadro vero e proprio (bordo/foto), non sul wrapper esterno: per
   * casi come il bordo arancione delle card Activities solo mobile, senza toccare ogni card del
   * sito che passa da qui. */
  frameClassName?: string;
  /** Scarto facoltativo sulla sfumatura scura dietro l'overlay: per nasconderla dove non c'è più
   * testo sopra la foto (es. Activities da desktop, 2026-11-04) senza toglierla dove serve ancora
   * (es. la stessa card su mobile). Di base sempre visibile quando c'è un overlay, come prima. */
  scrimClassName?: string;
  /** Scarto facoltativo sul contenitore di `overlay` (es. margine interno più stretto solo nelle card del profilo). */
  overlayClassName?: string;
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
  belowClassName,
  menu,
  className,
  frameClassName,
  scrimClassName,
  overlayClassName,
}: CoverFrameProps) {
  return (
    <div data-ui={`card-${format}`} className={cn("group relative transition-transform duration-300 hover:-translate-y-1", className)}>
      <Link href={href} className="block">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-border bg-surface-2 shadow-card transition-[border-color,box-shadow] duration-300 group-hover:border-ember-line group-hover:shadow-glow",
            RATIO[format],
            (format === "journey" || format === "episode") && "max-md:border-ember-line md:border-transparent",
            frameClassName
          )}
        >
          {imageUrl ? (
            <FadeImage
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes={SIZES[format]}
              quality={COVER_IMAGE_QUALITY}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className={cn("absolute inset-0 grid place-items-center p-4 text-center", COVER_PLACEHOLDER)}>
              {placeholder}
            </div>
          )}
          {overlay && <div className={cn("card-scrim absolute inset-0", scrimClassName)} />}
          {/* right-2.5 oltre a left-2.5: senza un bordo destro il riquadro non ha una larghezza
           * definita (si restringe al contenuto), e un max-w percentuale dentro (es. il titolo
           * di FreeEventsSection) non si calcola su niente e tronca il testo quasi subito. */}
          {topLeft && <div className="absolute left-2.5 right-2.5 top-2.5">{topLeft}</div>}
          {topRight && <div className="absolute right-2.5 top-2.5 z-10">{topRight}</div>}
          {center && <div className="absolute inset-0 grid place-items-center">{center}</div>}
          {overlay && <div className={cn("absolute inset-x-0 bottom-0 p-3 text-on-photo", overlayClassName)}>{overlay}</div>}
        </div>
        {below && <div data-part="card-below" className={cn("mt-3", belowClassName)}>{below}</div>}
      </Link>
      {menu && (
        <div className="absolute right-2 top-2 z-10 max-md:opacity-100 transition-opacity duration-200 md:opacity-0 md:focus-within:opacity-100 md:group-hover:opacity-100">
          {menu}
        </div>
      )}
    </div>
  );
}

/** Etichetta sopra la foto (categoria, stato "Discovery"/"Archived"). Bordo arancione sempre,
 * computer e telefono: vive qui una volta sola, ogni pillola del sito lo eredita. */
export function CoverChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span data-ui="cover-chip" className={cn("inline-block rounded-full border border-ember-line bg-scrim px-2 py-0.5 text-sm font-semibold text-on-photo backdrop-blur-md", className)}>
      {children}
    </span>
  );
}

/** Titolo sopra la foto: bianco pieno, arancione al passaggio del mouse. Lo spazio sopra
 * (pillola categoria appena sopra, computer e telefono) vive qui una volta sola: ogni card con
 * copertina lo eredita, non va più ripetuto/aggiustato card per card. */
export function CoverTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("mt-0.5 truncate text-lg font-bold leading-tight text-on-photo transition-colors group-hover:text-ember", className)}>
      {children}
    </h3>
  );
}

/** Icona tonda "play" al centro delle card video. Da computer compare solo al passaggio del mouse. */
export function CoverPlay({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("grid h-12 w-12 place-items-center rounded-full bg-scrim text-ember backdrop-blur-md transition-transform duration-300 md:transition-[transform,opacity] group-hover:scale-110 md:opacity-0 md:group-hover:opacity-100", className)}>
      {children}
    </span>
  );
}
