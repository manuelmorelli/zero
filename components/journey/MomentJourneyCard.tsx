import Image from "next/image";
import Link from "next/link";
import { formatCompactNumber } from "@/lib/utils";
import type { JourneyCardData } from "@/components/journey/JourneyCard";

type MomentJourneyCardProps = {
  journey: JourneyCardData;
  rank: number;
};

/** Card per la riga "Journeys of the Moment": stesso stile delle altre card, con numero di posizione. */
export function MomentJourneyCard({ journey, rank }: MomentJourneyCardProps) {
  const { title, description, coverUrl, category, creator, followersCount } = journey;

  return (
    <Link
      href={`/journeys/${journey.id}`}
      style={{ scrollSnapAlign: "start" }}
      className="group w-64 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="256px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black transition-transform duration-500 ease-out group-hover:scale-110" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
        <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-sm font-black text-white backdrop-blur-sm">
          {rank}
        </span>
      </div>

      <div className="p-4">
        {category && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            {category}
          </p>
        )}
        <h3 className="mt-2 text-sm font-bold leading-snug">{title}</h3>
        {description && (
          <p className="mt-1 line-clamp-1 text-xs text-ink-muted">{description}</p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px] font-semibold text-ink-muted">
              {creator.displayName.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">{creator.displayName}</span>
          </span>
          <span className="shrink-0">{formatCompactNumber(followersCount)} followers</span>
        </div>
      </div>
    </Link>
  );
}
