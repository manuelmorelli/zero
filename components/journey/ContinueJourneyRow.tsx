import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { ContinueJourneyItem } from "@/lib/discovery/continueJourneys";

/** Riga "Continue Your Journey": vive sulla home del Profilo, non sulla Home generale
 * (decisione presa con Manuel — la Home mostra scoperta, il Profilo la propria continuità). */
export function ContinueJourneyRow({ items }: { items: ContinueJourneyItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-4 md:px-8">
      <Reveal>
        <SectionHeading
          icon={<PlayCircle className="h-6 w-6" aria-hidden="true" />}
          title="Continue Your Journey"
          subtitle="Pick up right where you left off."
        />
      </Reveal>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <Reveal key={item.journeyId} delayMs={index * 70}>
            <Link
              href={
                item.episodeId
                  ? `/journeys/${item.journeyId}/episodes/${item.episodeId}`
                  : `/journeys/${item.journeyId}`
              }
              className="group flex overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-ink-muted"
            >
              <div className="relative aspect-square w-24 flex-shrink-0 overflow-hidden bg-surface-2">
                {item.coverUrl ? (
                  <Image src={item.coverUrl} alt={item.title} fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-center px-4 py-3">
                <h3 className="text-sm font-bold leading-snug text-ink">{item.title}</h3>
                <p className="mt-1 text-xs text-ink-muted">{item.creatorName}</p>
                {item.episodeTitle && (
                  <p className="mt-2 text-xs font-semibold text-ink-muted">
                    Continue: {item.episodeTitle}
                  </p>
                )}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
