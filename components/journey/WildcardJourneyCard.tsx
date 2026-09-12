import Link from "next/link";
import { Shuffle } from "lucide-react";

type WildcardJourneyCardProps = {
  /** Journey scelto a caso tra quelli della categoria della riga in cui compare la card. */
  journeyId: string;
  className?: string;
};

/** Card speciale a fine riga: porta a un Journey casuale della stessa categoria. */
export function WildcardJourneyCard({ journeyId, className }: WildcardJourneyCardProps) {
  return (
    <Link
      href={`/journeys/${journeyId}`}
      className={`group relative flex aspect-4/3 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-dashed border-ember/40 bg-surface-2 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-ember hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)] ${className ?? ""}`}
    >
      <span className="grid h-11 w-11 place-items-center rounded-full bg-ember/15 text-ember transition-transform duration-300 group-hover:scale-110">
        <Shuffle className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-bold text-ink">Wildcard</p>
        <p className="mt-1 text-xs text-ink-muted">A random Journey from this category</p>
      </div>
    </Link>
  );
}
