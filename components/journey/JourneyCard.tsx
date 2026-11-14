import { Play } from "lucide-react";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import { CardInfoRow } from "@/components/journey/CardInfoRow";
import { CoverChip, CoverFrame, CoverPlay } from "@/components/ui/cover-card";

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
  /** Episodi pubblicati: se presente, "N episodes" compare sotto il titolo. */
  episodeCount?: number;
  creator: {
    /** Per il link al profilo dal nome: assente sulle card dimostrative. */
    userId?: string;
    displayName: string;
    avatarUrl: string | null;
  };
};

type JourneyCardProps = {
  journey: JourneyCardData;
  className?: string;
  /** Contenuto assoluto sovrapposto in alto a destra, es. il badge "Archived". */
  badge?: React.ReactNode;
  /** Contenuto extra sotto la card (es. conteggio episodi in "Most Trusted", giorni rimasti in Discovery). */
  footer?: React.ReactNode;
};

// Il link fa parte del componente stesso (dentro CoverFrame): un punto della UI che dimentica di
// avvolgere la card in un <Link> è una classe di bug già capitata più volte. Per mostrare altro
// sotto la card si usa `footer`, mai un secondo <Link> attorno (sarebbe un <a> annidato).
//
// Formato ufficiale delle card Journey (2026-11-09): orizzontale 16:9, come i video di YouTube.
export function JourneyCard({ journey, className, badge, footer }: JourneyCardProps) {
  const { id, title, coverUrl, category, creator, journeyScore, episodeCount } = journey;

  return (
    <div className={className}>
      <CoverFrame
        format="journey"
        href={`/journeys/${id}`}
        imageUrl={coverUrl}
        imageAlt={title}
        topLeft={<CategoryIcon category={category} />}
        topRight={badge}
        center={
          <CoverPlay className="max-md:hidden">
            <Play className="h-4 w-4 translate-x-px fill-current" aria-hidden="true" />
          </CoverPlay>
        }
        overlay={
          <>
            {category && <CoverChip className="-mb-2.5 -ml-2 hidden px-2 py-0.5 md:block md:w-fit">{category}</CoverChip>}
          </>
        }
        below={
          <CardInfoRow title={title} episodeCount={episodeCount} creator={{ userId: creator.userId, name: creator.displayName, avatarUrl: creator.avatarUrl }} score={journeyScore} />
        }
      />
      {footer}
    </div>
  );
}
