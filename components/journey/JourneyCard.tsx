import Image from "next/image";
import { formatCompactNumber } from "@/lib/utils";

/**
 * Subset of Journey (+ Creator) fields from prisma/schema.prisma needed to render the card.
 * followersCount comes from Creator.followers (Follow[]), aggregated by the caller
 * (e.g. `_count: { select: { followers: true } }` on the creator query).
 */
export type JourneyCardData = {
  id: string;
  title: string;
  description?: string | null;
  coverUrl: string | null;
  category: string | null;
  creator: {
    displayName: string;
  };
  followersCount: number;
};

type JourneyCardProps = {
  journey: JourneyCardData;
};

export function JourneyCard({ journey }: JourneyCardProps) {
  const { title, coverUrl, category, creator, followersCount } = journey;

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-2">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black transition-transform duration-500 ease-out group-hover:scale-110" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute bottom-3 left-3 translate-y-2 text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Start from Ep. 1 →
        </span>
      </div>

      <div className="p-4">
        {category && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            {category}
          </p>
        )}
        <h3 className="mt-2 text-sm font-bold leading-snug">{title}</h3>
        <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
          <span>by {creator.displayName}</span>
          <span>{formatCompactNumber(followersCount)} followers</span>
        </div>
      </div>
    </div>
  );
}
