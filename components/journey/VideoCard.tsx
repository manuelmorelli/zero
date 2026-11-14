import { Play } from "lucide-react";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import { CardInfoRow } from "@/components/journey/CardInfoRow";
import { CoverChip, CoverFrame, CoverPlay } from "@/components/ui/cover-card";

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
};

/** Card di un episodio (formato ufficiale 21A: orizzontale 4:3, quattro per riga): copertina
 * del Journey come anteprima, link diretto all'episodio. */
export function VideoCard({ video, className, footer }: VideoCardProps) {
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
          <CardInfoRow title={title} creator={{ userId: creatorUserId, name: creatorName, avatarUrl: creatorAvatarUrl }} score={journeyScore} />
        }
      />
      {footer}
    </div>
  );
}
