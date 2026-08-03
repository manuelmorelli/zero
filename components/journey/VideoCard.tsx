import Image from "next/image";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";
import type { LatestVideoItem } from "@/lib/discovery/latestVideos";

type VideoCardProps = {
  video: LatestVideoItem;
};

/** Card per la riga "Latest Videos": copertina del Journey come anteprima, link diretto all'episodio. */
export function VideoCard({ video }: VideoCardProps) {
  const { journeyId, episodeId, title, coverUrl, creatorName, createdAt } = video;

  return (
    <Link
      href={`/journeys/${journeyId}#${episodeId}`}
      style={{ scrollSnapAlign: "start" }}
      className="group w-64 shrink-0"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-surface-2 transition-transform duration-300 group-hover:-translate-y-1">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="256px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
        )}
        <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/10" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <PlayIcon className="h-4 w-4 translate-x-[1px]" />
          </span>
        </span>
      </div>

      <h3 className="mt-3 truncate text-sm font-bold leading-snug">{title}</h3>
      <div className="mt-1 flex items-center justify-between text-xs text-ink-muted">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px] font-semibold text-ink-muted">
            {creatorName.charAt(0).toUpperCase()}
          </span>
          <span className="truncate">{creatorName}</span>
        </span>
        <span className="shrink-0">{formatRelativeDate(createdAt)}</span>
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
