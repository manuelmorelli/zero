import { ShieldCheck } from "lucide-react";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import { CreatorProfileLink } from "@/components/journey/CreatorProfileLink";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { CardTitle } from "@/components/ui/heading";
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
  /** Pillola categoria e titolo escono dalla foto e il titolo va sotto, accanto al creator. */
  titleBelow?: boolean;
};

// Il link fa parte del componente stesso (dentro CoverFrame): un punto della UI che dimentica di
// avvolgere la card in un <Link> è una classe di bug già capitata più volte. Per mostrare altro
// sotto la card si usa `footer`, mai un secondo <Link> attorno (sarebbe un <a> annidato).
//
// Formato ufficiale delle card Journey (2026-11-09): orizzontale 16:9, come i video di YouTube.
export function JourneyCard({ journey, className, badge, footer, titleBelow }: JourneyCardProps) {
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
        overlay={
          <>
            {category && !titleBelow && <CoverChip className="-ml-2 mt-2 px-2 py-0.5">{category}</CoverChip>}
            <CoverTitle className={titleBelow ? "hidden" : undefined}>{title}</CoverTitle>
            {episodeCount !== undefined && (
              <p className={cn("mt-1 text-sm", titleBelow && "hidden")}>
                {episodeCount} {episodeCount === 1 ? "episode" : "episodes"}
              </p>
            )}
          </>
        }
        below={
          <div className={cn("flex items-center justify-between gap-2 text-sm", titleBelow && "-mt-2.5")}>
            {titleBelow && (
              <div className="min-w-0 flex-1 self-start">
                <CardTitle className="truncate text-base">{title}</CardTitle>
                {episodeCount !== undefined && (
                  <p className="text-sm leading-tight text-ink-muted">
                    {episodeCount} {episodeCount === 1 ? "episode" : "episodes"}
                  </p>
                )}
              </div>
            )}
            <CreatorProfileLink userId={creator.userId} className="flex min-w-0 items-center gap-1.5 text-ink-muted">
              <Avatar name={creator.displayName} avatarUrl={creator.avatarUrl} size="xs" className={titleBelow ? "h-10 w-10" : undefined} />
              <span className={cn("truncate", titleBelow && "sr-only")}>{creator.displayName}</span>
            </CreatorProfileLink>
            {journeyScore !== undefined && (
              <span className="flex shrink-0 items-center gap-1 font-bold text-ember">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {journeyScore}
              </span>
            )}
          </div>
        }
      />
      {footer}
    </div>
  );
}
