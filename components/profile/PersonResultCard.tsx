import Link from "next/link";
import { formatCompactNumber } from "@/lib/utils";
import { Avatar } from "@/components/common/Avatar";
import type { PersonSearchResult } from "@/lib/search/searchPeople";

type PersonResultCardProps = {
  person: PersonSearchResult;
};

/** Stessa impostazione visiva di CreatorResultCard, per una persona che non ha (ancora)
 * pubblicato nulla — niente bio/follower da mostrare oltre al conteggio dei follower. */
export function PersonResultCard({ person }: PersonResultCardProps) {
  const { name, username, id, followersCount } = person;

  return (
    <Link
      href={`/profile/${username ?? id}`}
      className="group block rounded-xl border border-border bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]"
    >
      <Avatar name={name} className="h-10 w-10 text-xs transition-transform duration-300 group-hover:scale-105" />
      <h3 className="mt-3 text-sm font-bold leading-snug">{name}</h3>
      {username && <p className="mt-1 text-xs text-ink-muted">@{username}</p>}
      <p className="mt-3 text-xs text-ink-faint">{formatCompactNumber(followersCount)} followers</p>
    </Link>
  );
}
