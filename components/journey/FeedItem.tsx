import Image from "next/image";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";
import type { FeedItem as FeedItemData } from "@/lib/discovery/feed";

type FeedItemProps = {
  item: FeedItemData;
};

export function FeedItem({ item }: FeedItemProps) {
  const href =
    item.type === "journey"
      ? `/journeys/${item.journeyId}`
      : `/journeys/${item.journeyId}/episodes/${item.episodeId}`;
  const title = item.type === "journey" ? item.title : item.journeyTitle;
  const description =
    item.type === "journey" ? "Published a new Journey" : `New episode: ${item.episodeTitle}`;

  return (
    <Link
      href={href}
      className="group flex items-center overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-ink-muted"
    >
      <div className="relative aspect-square w-20 flex-shrink-0 overflow-hidden bg-surface-2">
        {item.coverUrl ? (
          <Image src={item.coverUrl} alt={title} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center px-4 py-3">
        <p className="text-xs font-semibold text-ink-muted">by {item.creatorName}</p>
        <h3 className="mt-1 text-sm font-bold leading-snug text-ink">{title}</h3>
        <p className="mt-2 text-xs text-ink-muted">{description}</p>
      </div>
      <span className="flex-shrink-0 px-4 text-xs text-ink-faint">
        {formatRelativeDate(item.date)}
      </span>
    </Link>
  );
}
