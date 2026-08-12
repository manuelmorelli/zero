import Link from "next/link";
import { formatCompactNumber } from "@/lib/utils";
import { Avatar } from "@/components/common/Avatar";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";

type CreatorResultCardProps = {
  creator: CreatorSearchResult;
};

export function CreatorResultCard({ creator }: CreatorResultCardProps) {
  const { name, bio, username, id, followersCount } = creator;

  return (
    <Link
      href={`/profile/${username ?? id}`}
      className="block rounded-xl border border-border bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]"
    >
      <Avatar name={name} className="h-10 w-10 text-xs" />
      <h3 className="mt-3 text-sm font-bold leading-snug">{name}</h3>
      {bio && <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{bio}</p>}
      <p className="mt-3 text-xs text-ink-faint">{formatCompactNumber(followersCount)} followers</p>
    </Link>
  );
}
