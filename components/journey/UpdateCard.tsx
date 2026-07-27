import { formatRelativeDate } from "@/lib/utils";
import type { FollowedUpdate } from "@/lib/discovery/updates";

type UpdateCardProps = {
  update: FollowedUpdate;
};

export function UpdateCard({ update }: UpdateCardProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold text-ink-muted">{update.creatorName}</p>
      <p className="mt-2 flex-1 whitespace-pre-wrap text-sm text-ink">{update.content}</p>
      <p className="mt-3 text-xs text-ink-faint">{formatRelativeDate(update.publishedAt)}</p>
    </div>
  );
}
