import Image from "next/image";
import Link from "next/link";

type FeaturedJourneySectionProps = {
  journey: {
    id: string;
    title: string;
    coverUrl: string | null;
    category: string | null;
  };
};

// Il Journey "in evidenza": tra i Journey pubblicati del creator, quello che ha ricevuto
// l'episodio più recente (vedi lib/profile/featuredJourney.ts). Con un solo Journey pubblicato
// coincide semplicemente con quello.
export function FeaturedJourneySection({ journey }: FeaturedJourneySectionProps) {
  return (
    <Link
      href={`/journeys/${journey.id}`}
      className="group block self-start transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border transition-[border-color,box-shadow] duration-300 group-hover:border-ember/40 group-hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]">
        {journey.coverUrl ? (
          <Image
            src={journey.coverUrl}
            alt={journey.title}
            fill
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider backdrop-blur-md">
          In Progress
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-ember">
            {journey.title}
          </h3>
          {journey.category && (
            <p className="mt-1 text-[0.7rem] uppercase tracking-wider text-ink-faint">{journey.category}</p>
          )}
        </div>
        <span className="inline-flex w-fit shrink-0 items-center justify-center rounded-full border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] px-4 py-1.5 text-xs font-semibold text-ember backdrop-blur-md transition-colors group-hover:from-ember/15">
          View Journey
        </span>
      </div>
    </Link>
  );
}
