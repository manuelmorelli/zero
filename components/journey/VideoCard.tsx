import { Play, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import { CreatorProfileLink } from "@/components/journey/CreatorProfileLink";
import { CardTitle } from "@/components/ui/heading";
import { CoverChip, CoverFrame, CoverPlay, CoverTitle } from "@/components/ui/cover-card";

/** Solo i campi che la card usa davvero: così può mostrare sia un LatestVideoItem
 * (lib/discovery/latestVideos.ts) sia un EpisodeMomentSearchItem (lib/search/searchEpisodeMoments.ts)
 * senza che quest'ultimo debba portarsi dietro campi che non gli servono (es. createdAt). */
type VideoCardData = {
  episodeId: string;
  journeyId: string;
  title: string;
  coverUrl: string | null;
  category: string | null;
  creatorName: string;
  creatorAvatarUrl: string | null;
  creatorUserId?: string;
  journeyScore?: number;
};

type VideoCardProps = {
  video: VideoCardData;
  className?: string;
  /** Contenuto extra sotto la card (es. il minuto e il motivo di un risultato della ricerca per senso). */
  footer?: React.ReactNode;
  /** Pillola categoria e titolo escono dalla foto e il titolo va sotto, accanto al creator. */
  titleBelow?: boolean;
};

/** Card di un episodio (formato ufficiale 21A: orizzontale 4:3, quattro per riga): copertina
 * del Journey come anteprima, link diretto all'episodio. */
export function VideoCard({ video, className, footer, titleBelow }: VideoCardProps) {
  const { journeyId, episodeId, title, coverUrl, category, creatorName, creatorAvatarUrl, creatorUserId, journeyScore } = video;

  return (
    <div className={className}>
      <CoverFrame
        format="episode"
        href={`/journeys/${journeyId}/episodes/${episodeId}`}
        imageUrl={coverUrl}
        imageAlt={title}
        topLeft={<CategoryIcon category={category} />}
        center={
          <CoverPlay>
            <Play className="h-4 w-4 translate-x-px fill-current" aria-hidden="true" />
          </CoverPlay>
        }
        overlay={
          <>
            {category && !titleBelow && <CoverChip className="-ml-2 mt-2 px-2 py-0.5">{category}</CoverChip>}
            <CoverTitle className={titleBelow ? "hidden" : undefined}>{title}</CoverTitle>
          </>
        }
        below={
          <div className={cn("flex items-center justify-between gap-2 text-sm", titleBelow && "-mt-2.5")}>
            {titleBelow && <CardTitle className="min-w-0 flex-1 truncate text-base self-start">{title}</CardTitle>}
            <CreatorProfileLink userId={creatorUserId} className="flex min-w-0 items-center gap-1.5 text-ink-muted">
              <Avatar name={creatorName} avatarUrl={creatorAvatarUrl} size="xs" className={titleBelow ? "h-10 w-10" : undefined} />
              <span className={cn("truncate", titleBelow && "sr-only")}>{creatorName}</span>
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
