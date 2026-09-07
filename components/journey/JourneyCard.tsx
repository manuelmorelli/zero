import Image from "next/image";
import Link from "next/link";
import { CategoryIcon } from "@/components/journey/CategoryIcon";

/** Subset of Journey (+ Creator) fields from prisma/schema.prisma needed to render the card. */
export type JourneyCardData = {
  id: string;
  title: string;
  description?: string | null;
  coverUrl: string | null;
  category: string | null;
  creator: {
    displayName: string;
  };
};

type JourneyCardProps = {
  journey: JourneyCardData;
  className?: string;
  style?: React.CSSProperties;
  /** Contenuto assoluto sovrapposto in alto a destra, es. il badge "Archived". */
  badge?: React.ReactNode;
  /** Contenuto extra sotto la card (es. conteggio episodi in "Top Journeys", giorni rimasti in Discovery). */
  footer?: React.ReactNode;
};

// Il link fa parte del componente stesso (non va aggiunto dai chiamanti): un punto della UI
// che dimentica di avvolgere la card in un <Link> è una classe di bug già capitata più volte
// (vedi 99_Current_Project_Status.md). Se un chiamante deve mostrare altro contenuto sotto la
// card (es. il conteggio episodi in "Top Journeys"), usa la prop `footer` invece di avvolgere
// di nuovo la card in un secondo <Link>, che creerebbe un <a> annidato non valido.
//
// Titolo/categoria/creator sotto la foto, non sovrapposti: stesso stile ormai unico in tutto il
// sito (VideoCard, ContentCard, JourneyGrid della Dashboard), non più un'eccezione a parte.
export function JourneyCard({ journey, className, style, badge, footer }: JourneyCardProps) {
  const { id, title, coverUrl, category, creator } = journey;

  return (
    <div className={className} style={style}>
      <Link href={`/journeys/${id}`} className="group block transition-transform duration-300 hover:-translate-y-1">
        <div className="relative aspect-4/5 overflow-hidden rounded-xl border border-border transition-[border-color,box-shadow] duration-300 group-hover:border-ember/40 group-hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]">
          {badge && <div className="absolute right-3 top-3 z-10">{badge}</div>}

          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black transition-transform duration-700 group-hover:scale-105" />
          )}
          <CategoryIcon category={category} className="absolute left-2.5 top-2.5" />
        </div>

        <div className="mt-3">
          {category && (
            <p className="text-[0.6rem] uppercase tracking-[0.22em] text-ink-faint">{category}</p>
          )}
          <h3 className="mt-1 truncate text-base font-bold leading-tight text-ink transition-colors group-hover:text-ember">
            {title}
          </h3>
          <p className="mt-1.5 truncate text-xs text-ink-muted">{creator.displayName}</p>
        </div>
      </Link>
      {footer}
    </div>
  );
}
