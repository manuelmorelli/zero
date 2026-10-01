import { ShieldCheck } from "lucide-react";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import { Avatar } from "@/components/ui/avatar";
import { CoverChip, CoverFrame, CoverTitle } from "@/components/ui/cover-card";

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
    avatarUrl: string | null;
  };
};

type JourneyCardProps = {
  journey: JourneyCardData;
  className?: string;
  /** Contenuto assoluto sovrapposto in alto a destra, es. il badge "Archived". */
  badge?: React.ReactNode;
  /** Contenuto extra sotto la card (es. conteggio episodi in "Top Journeys", giorni rimasti in Discovery). */
  footer?: React.ReactNode;
};

// Il link fa parte del componente stesso (dentro CoverFrame): un punto della UI che dimentica di
// avvolgere la card in un <Link> è una classe di bug già capitata più volte. Per mostrare altro
// sotto la card si usa `footer`, mai un secondo <Link> attorno (sarebbe un <a> annidato).
//
// Formato ufficiale delle card Journey (scelta 20C): verticale 4:5, cinque per riga.
export function JourneyCard({ journey, className, badge, footer }: JourneyCardProps) {
  const { id, title, coverUrl, category, creator, journeyScore } = journey;

  return (
    <div className={className}>
      <CoverFrame
        format="journey"
        href={`/journeys/${id}`}
        imageUrl={coverUrl}
        imageAlt={title}
        topLeft={<CategoryIcon category={category} />}
        topRight={badge}
        overlay={
          <>
            {category && <CoverChip>{category}</CoverChip>}
            <CoverTitle className="mt-2">{title}</CoverTitle>
            <div className="mt-2 flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-1.5">
                <Avatar name={creator.displayName} avatarUrl={creator.avatarUrl} size="xs" />
                <span className="truncate">{creator.displayName}</span>
              </span>
              {journeyScore !== undefined && (
                <span className="flex shrink-0 items-center gap-1 font-bold text-ember">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  {journeyScore}
                </span>
              )}
            </div>
          </>
        }
      />
      {footer}
    </div>
  );
}
