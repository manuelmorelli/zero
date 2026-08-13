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
export function JourneyCard({ journey, className, style, badge, footer }: JourneyCardProps) {
  const { id, title, coverUrl, category, creator } = journey;

  return (
    <div className={className} style={style}>
      <Link
        href={`/journeys/${id}`}
        className="group relative block aspect-4/5 overflow-hidden rounded-xl border border-border"
      >
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
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/25" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <CategoryIcon category={category} />
          <div>
            {category && (
              <p className="text-[0.6rem] uppercase tracking-[0.22em] text-ink-faint">
                {category}
              </p>
            )}
            <h3 className="mt-1.5 text-base font-bold leading-tight">{title}</h3>
            <p className="mt-3 truncate text-xs text-ink-muted">by {creator.displayName}</p>
          </div>
        </div>
      </Link>
      {footer}
    </div>
  );
}
