import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/common/Avatar";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import type { JourneyCardData } from "@/components/journey/JourneyCard";

type MomentJourneyCardProps = {
  journey: JourneyCardData;
  rank: number;
};

/** Card per la riga "Journeys of the Moment": copertina 4:3, numero di posizione + icona categoria
 * sovrapposti alla foto, testo sotto — stesso stile ormai unico di JourneyCard/VideoCard. */
export function MomentJourneyCard({ journey, rank }: MomentJourneyCardProps) {
  const { title, description, coverUrl, category, creator } = journey;

  return (
    <Link
      href={`/journeys/${journey.id}`}
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
        <div className="absolute inset-0 bg-gradient-to-t from-bg/50 to-transparent" />
        <div className="absolute left-2.5 top-2.5 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-white/15 bg-bg/40 text-sm font-bold text-ink backdrop-blur-md">
            {rank}
          </span>
          <CategoryIcon category={category} />
        </div>
      </div>

      <div className="mt-3">
        {category && (
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-ink-faint">{category}</p>
        )}
        <h3 className="mt-1 text-base font-bold leading-tight text-ink transition-colors group-hover:text-ember">
          {title}
        </h3>
        {description && <p className="mt-1 line-clamp-1 text-xs text-ink-muted">{description}</p>}
        <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-ink-muted">
          <Avatar name={creator.displayName} />
          <span className="truncate">{creator.displayName}</span>
        </div>
      </div>
    </Link>
  );
}
