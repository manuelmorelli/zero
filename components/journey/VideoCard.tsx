import { Play, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import { CoverChip, CoverFrame, CoverPlay, CoverTitle } from "@/components/ui/cover-card";
import type { LatestVideoItem } from "@/lib/discovery/latestVideos";

type VideoCardProps = {
  video: LatestVideoItem;
  className?: string;
};

/** Card di un episodio (formato ufficiale 21A: orizzontale 4:3, quattro per riga): copertina
 * del Journey come anteprima, link diretto all'episodio. */
export function VideoCard({ video, className }: VideoCardProps) {
  const { journeyId, episodeId, title, coverUrl, category, creatorName, journeyScore } = video;

  return (
    <CoverFrame
      format="episode"
      className={className}
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
              <Avatar name={creatorName} size="xs" />
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
  );
}
