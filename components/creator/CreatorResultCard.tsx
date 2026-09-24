import Link from "next/link";
import { formatCompactNumber } from "@/lib/utils";
import { Avatar } from "@/components/common/Avatar";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";

type CreatorResultCardProps = {
  creator: CreatorSearchResult;
};

export function CreatorResultCard({ creator }: CreatorResultCardProps) {
  const { name, bio, username, id, avatarUrl, followersCount } = creator;

  return (
    <Link
      href={`/profile/${username ?? id}`}
      className="group relative block overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-[0_20px_40px_-22px_oklch(0.769_0.155_70.5_/_35%)] transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_20px_40px_-16px_rgba(226,145,77,0.5)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,_oklch(0.769_0.155_70.5_/_20%),_transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <Avatar
        name={name}
        avatarUrl={avatarUrl}
        className="h-10 w-10 text-xs transition-transform duration-300 group-hover:scale-105"
      />
      <h3 className="mt-3 text-sm font-bold leading-snug">{name}</h3>
      {bio && <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{bio}</p>}
      <p className="mt-3 text-xs text-ink-faint">{formatCompactNumber(followersCount)} followers</p>
    </Link>
  );
}
