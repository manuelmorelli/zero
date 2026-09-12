import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

type FeaturedJourneySectionProps = {
  journey: {
    id: string;
    title: string;
    coverUrl: string | null;
    category: string | null;
    journeyScore: number;
    status: string;
  };
};

// Il Journey "in evidenza": tra i Journey pubblicati del creator, quello che ha ricevuto
// l'episodio più recente (vedi lib/profile/featuredJourney.ts). Con un solo Journey pubblicato
// coincide semplicemente con quello. Categoria/titolo sovrapposti alla foto, stesso "poster
// style" di JourneyCard/VideoCard/ContentCard.
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
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider backdrop-blur-md">
          In Progress
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3.5">
          {journey.category && (
            <span className="inline-block rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              {journey.category}
            </span>
          )}
          <h3 className="mt-2 truncate text-lg font-bold leading-tight text-white transition-colors group-hover:text-ember">
            {journey.title}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-2">
            {journey.status === "PUBLISHED" ? (
              <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-ember">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {journey.journeyScore}
              </span>
            ) : (
              <span />
            )}
            <span className="inline-flex w-fit shrink-0 items-center justify-center rounded-full border border-ember/20 bg-gradient-to-b from-ember/15 to-white/[0.02] px-4 py-1.5 text-xs font-semibold text-ember backdrop-blur-md transition-colors group-hover:from-ember/25">
              View Journey
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
