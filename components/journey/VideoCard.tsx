import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import { Avatar } from "@/components/common/Avatar";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import type { LatestVideoItem } from "@/lib/discovery/latestVideos";

type VideoCardProps = {
  video: LatestVideoItem;
};

/** Card per la riga "Latest Videos": copertina del Journey come anteprima, link diretto all'episodio. */
export function VideoCard({ video }: VideoCardProps) {
  const { journeyId, episodeId, title, coverUrl, category, creatorName, createdAt } = video;

  return (
    <Link href={`/journeys/${journeyId}/episodes/${episodeId}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black transition-transform duration-700 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-bg/40 transition-colors group-hover:bg-bg/25" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-bg/50 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
            <PlayIcon className="h-4 w-4 translate-x-[1px] fill-current" />
          </span>
        </span>
        <CategoryIcon category={category} className="absolute left-2.5 top-2.5 h-7 w-7" />
      </div>

      <h3 className="mt-3 truncate text-sm font-semibold transition-colors group-hover:text-ember">{title}</h3>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-ink-muted">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={creatorName} />
          <span className="truncate">{creatorName}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {formatRelativeDate(createdAt)}
        </span>
      </div>
    </Link>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2 1.5v9l8-4.5-8-4.5z" />
    </svg>
  );
}
