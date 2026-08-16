import Image from "next/image";
import Link from "next/link";

type FeaturedJourneySectionProps = {
  journey: {
    id: string;
    title: string;
    description: string | null;
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
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]"
    >
      <div className="relative h-44 shrink-0 overflow-hidden md:h-52">
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

      <div className="flex flex-1 flex-col justify-center p-4">
        {journey.category && (
          <p className="text-[0.7rem] uppercase tracking-wider text-ink-faint">{journey.category}</p>
        )}
        <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">{journey.title}</h3>
        {journey.description && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{journey.description}</p>
        )}
        <span className="mt-4 inline-flex w-fit items-center justify-center rounded-full bg-ink px-4 py-2.5 text-[0.8rem] font-semibold text-bg transition-colors group-hover:bg-ink-muted">
          View Journey
        </span>
      </div>
    </Link>
  );
}
