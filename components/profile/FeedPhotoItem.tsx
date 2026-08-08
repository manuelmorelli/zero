import Image from "next/image";
import { formatRelativeDate } from "@/lib/utils";
import { LikeButton } from "@/components/journey/LikeButton";
import type { CreatorFeedItem } from "@/lib/profile/creatorFeed";

type FeedPhotoItemProps = {
  item: CreatorFeedItem;
  isLoggedIn: boolean;
};

export function FeedPhotoItem({ item, isLoggedIn }: FeedPhotoItemProps) {
  const caption = item.type === "episode" ? item.caption : item.content;
  const heading = item.type === "episode" ? item.title : null;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-2">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={heading ?? "Update"}
            fill
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
        )}
        {item.type === "update" && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            Update
          </span>
        )}
      </div>

      <div className="p-4">
        {heading && <h3 className="text-sm font-bold text-ink">{heading}</h3>}
        {caption && <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink-muted">{caption}</p>}

        <div className="mt-3 flex items-center justify-between">
          <LikeButton
            targetType={item.type === "episode" ? "EPISODE" : "UPDATE"}
            targetId={item.type === "episode" ? item.episodeId : item.updateId}
            initialLikeCount={item.likeCount}
            initialIsLiked={item.isLiked}
            isLoggedIn={isLoggedIn}
          />
          <span className="text-xs text-ink-faint">{formatRelativeDate(item.date)}</span>
        </div>
      </div>
    </article>
  );
}
