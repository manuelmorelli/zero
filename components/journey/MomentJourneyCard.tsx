import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/common/Avatar";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import type { JourneyCardData } from "@/components/journey/JourneyCard";

type MomentJourneyCardProps = {
  journey: JourneyCardData;
  rank: number;
};

/** Card per la riga "Journeys of the Moment": copertina 4:3, numero di posizione + icona categoria in alto. */
export function MomentJourneyCard({ journey, rank }: MomentJourneyCardProps) {
  const { title, description, coverUrl, category, creator } = journey;

  return (
    <Link
      href={`/journeys/${journey.id}`}
      className="group relative block aspect-4/3 overflow-hidden rounded-xl border border-border transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]"
    >
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
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/25" />
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-white/15 bg-bg/40 text-sm font-bold backdrop-blur-md">
            {rank}
          </span>
          <CategoryIcon category={category} />
        </div>
        <div>
          {category && (
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.65rem] font-medium backdrop-blur-md">
              {category}
            </span>
          )}
          <h3 className="mt-2.5 text-lg font-bold leading-tight">{title}</h3>
          {description && <p className="mt-1 line-clamp-1 text-xs text-ink-muted">{description}</p>}
          <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-ink-muted">
            <Avatar name={creator.displayName} />
            <span className="truncate">by {creator.displayName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
