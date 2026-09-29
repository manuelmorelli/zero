import { formatCompactNumber } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { CoverFrame } from "@/components/ui/cover-card";
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

/** Card ufficiale di una persona (scelta 22A): foto verticale che riempie la card, nome e
 * follower sotto. Usata ovunque compaia una persona (Journeyers, Creators, Wildcards, Ricerca).
 * Le iniziali restano solo come ripiego per chi non ha ancora una foto. */
export function JourneyerCard({ journeyer, className }: JourneyerCardProps) {
  const { id, username, name, avatarUrl, followersCount } = journeyer;

  return (
    <CoverFrame
      format="person"
      className={className}
      href={`/profile/${username ?? id}`}
      imageUrl={avatarUrl}
      imageAlt={name}
      placeholder={<Avatar name={name} size="xl" />}
      below={
        <>
          <CardTitle className="truncate transition-colors group-hover:text-ember">{name}</CardTitle>
          <p className="mt-1 truncate text-sm text-ink-muted">{formatCompactNumber(followersCount)} followers</p>
        </>
      }
    />
  );
}
