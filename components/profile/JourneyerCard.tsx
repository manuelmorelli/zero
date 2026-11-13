import Link from "next/link";
import { cn, formatCompactNumber } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { CardTitle } from "@/components/ui/heading";

type JourneyerCardProps = {
  /** Qualunque persona: creator (CreatorSearchResult) o utente (PersonSearchResult). */
  journeyer: {
    id: string;
    username: string | null;
    name: string;
    avatarUrl: string | null;
    followersCount: number;
  };
  className?: string;
};

/** Card ufficiale di una persona: foto tonda (stessa Avatar del profilo), nome e follower sotto,
 * centrati. Usata ovunque compaia una persona (Journeyers, Creators, Wildcards, Ricerca).
 * Le iniziali restano solo come ripiego per chi non ha ancora una foto. */
export function JourneyerCard({ journeyer, className }: JourneyerCardProps) {
  const { id, username, name, avatarUrl, followersCount } = journeyer;

  return (
    <div className={cn("group transition-transform duration-300 hover:-translate-y-1", className)}>
      <Link href={`/profile/${username ?? id}`} className="flex flex-col items-center text-center">
        <Avatar
          name={name}
          avatarUrl={avatarUrl}
          size="xl"
          className="h-34 w-34 border-ember text-3xl transition-shadow duration-300 group-hover:shadow-glow"
        />
        <CardTitle className="mt-3 w-full truncate transition-colors group-hover:text-ember">{name}</CardTitle>
        <p className="mt-1 w-full truncate text-sm text-ink-muted">{formatCompactNumber(followersCount)} followers</p>
      </Link>
    </div>
  );
}
