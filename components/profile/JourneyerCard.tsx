import Image from "next/image";
import Link from "next/link";
import { formatCompactNumber } from "@/lib/utils";
import { Avatar } from "@/components/common/Avatar";
import type { CreatorSearchResult } from "@/lib/search/searchCreators";

type JourneyerCardProps = {
  journeyer: CreatorSearchResult;
  className?: string;
};

/** Card profilo per le righe di /journeyers: stessa dimensione e struttura di JourneyCard
 * (riquadro aspect-4/5 + testo sotto). Quando c'è una foto profilo riempie tutto il riquadro,
 * proprio come la copertina di un Journey — non un cerchietto piccolo al centro. Le iniziali
 * (tramite Avatar) restano solo come ripiego per chi non ha ancora una foto. */
export function JourneyerCard({ journeyer, className }: JourneyerCardProps) {
  const { id, username, name, avatarUrl, followersCount } = journeyer;

  return (
    <div className={className}>
      <Link
        href={`/profile/${username ?? id}`}
        className="group block transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="relative flex aspect-4/5 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-2 transition-[border-color,box-shadow] duration-300 group-hover:border-ember/40 group-hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <Avatar
              name={name}
              className="h-16 w-16 text-lg transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>

        <div className="mt-3">
          <h3 className="truncate text-base font-bold leading-tight text-ink transition-colors group-hover:text-ember">
            {name}
          </h3>
          <p className="mt-1.5 truncate text-xs text-ink-muted">
            {formatCompactNumber(followersCount)} followers
          </p>
        </div>
      </Link>
    </div>
  );
}
