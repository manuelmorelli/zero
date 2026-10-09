import { Play, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
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
  journeyScore?: number;
};

type VideoCardProps = {
  video: VideoCardData;
  className?: string;
  /** Contenuto extra sotto la card (es. il minuto e il motivo di un risultato della ricerca per senso). */
  footer?: React.ReactNode;
};

/** Card di un episodio (formato ufficiale 21A: orizzontale 4:3, quattro per riga): copertina
 * del Journey come anteprima, link diretto all'episodio. */
export function VideoCard({ video, className, footer }: VideoCardProps) {
  const { journeyId, episodeId, title, coverUrl, category, creatorName, creatorAvatarUrl, journeyScore } = video;

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
            {category && <CoverChip>{category}</CoverChip>}
            <CoverTitle className="mt-2">{title}</CoverTitle>
            <div className="mt-2 flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-1.5">
                <Avatar name={creatorName} avatarUrl={creatorAvatarUrl} size="xs" />
                <span className="truncate">{creatorName}</span>
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
