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
    <div className="group overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-ink-muted">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-2">
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
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
