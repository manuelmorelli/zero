import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import { Avatar } from "@/components/common/Avatar";

/** Subset of Journey (+ Creator) fields from prisma/schema.prisma needed to render the card. */
export type JourneyCardData = {
  id: string;
  title: string;
  description?: string | null;
  coverUrl: string | null;
  category: string | null;
  /** Journey Score (0-100, lib/scoring/journeyScore.ts): assente per i Journey ancora in
   * Discovery Phase, che non partecipano a questo punteggio (troppo recenti per essere affidabile). */
  journeyScore?: number;
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
// Titolo/categoria/creator/punteggio sovrapposti alla foto (sfumatura scura in basso), stesso
// "poster style" ormai unico in tutto il sito (VideoCard, MomentJourneyCard, ContentCard).
export function JourneyCard({ journey, className, style, badge, footer }: JourneyCardProps) {
  const { id, title, coverUrl, category, creator, journeyScore } = journey;

  return (
    <div className={className} style={style}>
      <Link href={`/journeys/${id}`} className="group block transition-transform duration-300 hover:-translate-y-1">
        <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-border transition-[border-color,box-shadow] duration-300 group-hover:border-ember/40 group-hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-transparent" />
          <CategoryIcon category={category} className="absolute left-2.5 top-2.5" />

          <div className="absolute inset-x-0 bottom-0 p-3">
            {category && (
              <span className="inline-block rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                {category}
              </span>
            )}
            <h3 className="mt-2 truncate text-base font-bold leading-tight text-white transition-colors group-hover:text-ember">
              {title}
            </h3>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5 text-xs text-white/85">
                <Avatar name={creator.displayName} className="h-5 w-5 text-[0.55rem]" />
                <span className="truncate">{creator.displayName}</span>
              </span>
              {journeyScore !== undefined && (
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-ember">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {journeyScore}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      {footer}
    </div>
  );
}
