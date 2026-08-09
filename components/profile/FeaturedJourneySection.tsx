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
    <section>
      <h2 className="text-lg font-bold tracking-tight text-ink">Featured Journey</h2>

      <Link
        href={`/journeys/${journey.id}`}
        className="group mt-4 flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-ink-muted sm:flex-row"
      >
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-surface-2 sm:aspect-square sm:w-56">
          {journey.coverUrl ? (
            <Image
              src={journey.coverUrl}
              alt={journey.title}
              fill
              sizes="(min-width: 640px) 224px, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center p-5">
          {journey.category && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              {journey.category}
            </p>
          )}
          <h3 className="mt-1.5 text-lg font-bold text-ink">{journey.title}</h3>
          {journey.description && (
            <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{journey.description}</p>
          )}
          <span className="mt-3 text-sm font-semibold text-ink-muted transition-colors group-hover:text-ink">
            View Journey →
          </span>
        </div>
      </Link>
    </section>
  );
}
