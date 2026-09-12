import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import type { JourneyCardData } from "@/components/journey/JourneyCard";

type MomentJourneyCardProps = {
  journey: JourneyCardData;
  rank: number;
};

/** Card per la riga "Journeys of the Moment": copertina 4:3, numero di posizione + icona categoria
 * in alto, testo/punteggio sovrapposti in basso — stesso "poster style" di JourneyCard/VideoCard. */
export function MomentJourneyCard({ journey, rank }: MomentJourneyCardProps) {
  const { title, coverUrl, category, creator, journeyScore } = journey;

  return (
    <Link
      href={`/journeys/${journey.id}`}
      className="group block transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-border transition-[border-color,box-shadow] duration-300 group-hover:border-ember/40 group-hover:shadow-[0_20px_40px_-20px_rgba(226,145,77,0.25)]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black transition-transform duration-700 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-transparent" />
        <div className="absolute left-2.5 top-2.5 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-white/15 bg-bg/40 text-sm font-bold text-ink backdrop-blur-md">
            {rank}
          </span>
          <CategoryIcon category={category} />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          {category && (
            <span className="inline-block rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              {category}
            </span>
          )}
          <h3 className="mt-2 truncate text-base font-bold leading-tight text-white transition-colors group-hover:text-ember">
            {title}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-white/85">
              <Avatar name={creator.displayName} className="h-5 w-5 text-[0.55rem]" />
              <span className="truncate">{creator.displayName}</span>
            </span>
            {journeyScore !== undefined && (
              <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-ember">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {journeyScore}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
