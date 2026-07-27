import Link from "next/link";
import { formatCompactNumber } from "@/lib/utils";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";

type CreatorResultCardProps = {
  creator: CreatorSearchResult;
};

export function CreatorResultCard({ creator }: CreatorResultCardProps) {
  const { name, bio, username, id, followersCount } = creator;

  return (
    <Link
      href={`/profile/${username ?? id}`}
      className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-ink-muted"
    >
      <h3 className="text-sm font-bold leading-snug">{name}</h3>
      {bio && <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{bio}</p>}
      <p className="mt-3 text-xs text-ink-faint">{formatCompactNumber(followersCount)} followers</p>
    </Link>
  );
}
