import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import type { LatestVideoItem } from "@/lib/discovery/latestVideos";

type VideoCardProps = {
  video: LatestVideoItem;
};

/** Card per la riga "Latest Videos": copertina del Journey come anteprima, link diretto
 * all'episodio — stesso "poster style" sovrapposto alla foto di JourneyCard/MomentJourneyCard. */
export function VideoCard({ video }: VideoCardProps) {
  const { journeyId, episodeId, title, coverUrl, category, creatorName, journeyScore } = video;

  return (
    <Link
      href={`/journeys/${journeyId}/episodes/${episodeId}`}
      className="group block transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-border transition-[border-color,box-shadow] duration-300 group-hover:border-ember/40 group-hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-transparent" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-bg/50 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
            <PlayIcon className="h-4 w-4 translate-x-[1px] fill-current text-ember" />
          </span>
        </span>
        <CategoryIcon category={category} className="absolute left-2.5 top-2.5 h-7 w-7" />

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
              <Avatar name={creatorName} className="h-5 w-5 text-[0.55rem]" />
              <span className="truncate">{creatorName}</span>
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
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2 1.5v9l8-4.5-8-4.5z" />
    </svg>
  );
}
