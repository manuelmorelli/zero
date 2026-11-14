import { ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CreatorProfileLink } from "@/components/journey/CreatorProfileLink";
import { CardTitle } from "@/components/ui/heading";

/** Riga sotto la foto delle card (Home e Profilo): titolo a sinistra, foto e nome del creator,
 * Trust Score. Vive qui una volta sola: ogni card che mette il titolo sotto la foto la eredita,
 * misure e posizioni non vanno più ripetute card per card. */
export function CardInfoRow({
  title,
  episodeCount,
  creator,
  score,
}: {
  title: string;
  /** Se presente, "N episodes" compare sotto il titolo. */
  episodeCount?: number;
  creator: { userId?: string; name: string; avatarUrl?: string | null };
  /** Trust Score accanto al creator; assente = niente scudo. */
  score?: number;
}) {
  return (
    <div className="-mt-2.5 flex items-center justify-between gap-2 text-sm">
      <div className="min-w-0 flex-1 self-start">
        <CardTitle className="truncate text-card-title">{title}</CardTitle>
        {episodeCount !== undefined && (
          <p className="text-sm leading-tight text-ink-muted">
            {episodeCount} {episodeCount === 1 ? "episode" : "episodes"}
          </p>
        )}
      </div>
      <CreatorProfileLink userId={creator.userId} className="flex min-w-0 items-center gap-1.5 text-ink-muted">
        <Avatar name={creator.name} avatarUrl={creator.avatarUrl} size="xs" className="h-10 w-10" />
        <span className="truncate">{creator.name}</span>
      </CreatorProfileLink>
      {score !== undefined && (
        <span className="flex shrink-0 items-center gap-1 font-bold text-ember">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {score}
        </span>
      )}
    </div>
  );
}
