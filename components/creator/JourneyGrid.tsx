import Image from "next/image";
import Link from "next/link";
import { JourneyCardMenu } from "@/components/profile/JourneyCardMenu";
import { CategoryIcon } from "@/components/journey/CategoryIcon";
import { PUBLICLY_REACHABLE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  DISCOVERY: "In Discovery",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export type GridJourney = {
  id: string;
  title: string;
  coverUrl: string | null;
  category: string | null;
  status: string;
  chapterCount: number;
  episodeCount: number;
  draftCount: number;
};

/** Selettore Journey a griglia della Dashboard: una card fotografica per Journey, badge di stato,
 * menu a tre puntini reale (riusa lo stesso componente del Profilo, vedi
 * components/profile/JourneyCardMenu.tsx). */
export function JourneyGrid({ journeys }: { journeys: GridJourney[] }) {
  // "Move Back"/"Move Forward" riordinano solo l'elenco pubblicamente raggiungibile (vedi
  // moveJourney in lib/actions/journey.ts): un Journey in Draft non ne fa parte, quindi le voci
  // restano disattivate per lui invece di sembrare funzionare senza fare nulla.
  const reachable = journeys.filter((journey) =>
    (PUBLICLY_REACHABLE_JOURNEY_STATUSES as string[]).includes(journey.status)
  );

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {journeys.map((journey) => {
        const reachableIndex = reachable.findIndex((item) => item.id === journey.id);
        const isReachable = reachableIndex !== -1;
        const isLive = journey.status === "PUBLISHED" || journey.status === "DISCOVERY";

        return (
          <li key={journey.id} className="group">
            <div className="relative w-full overflow-hidden rounded-xl border border-border transition-colors hover:border-ink-muted">
              <Link
                href={`/dashboard/journeys/${journey.id}`}
                className="relative block aspect-4/3 overflow-hidden"
              >
                {journey.coverUrl ? (
                  <Image
                    src={journey.coverUrl}
                    alt={journey.title}
                    fill
                    sizes="(min-width: 1024px) 20vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
                <span className="absolute left-2 top-2">
                  <CategoryIcon category={journey.category} className="h-7 w-7" />
                </span>
                <span
                  className={`absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wider backdrop-blur-md ${
                    isLive
                      ? "border-ember/40 bg-ember/15 text-ember"
                      : "border-white/15 bg-white/10 text-ink-muted"
                  }`}
                >
                  {STATUS_LABEL[journey.status] ?? journey.status}
                </span>
              </Link>

              <div className="absolute right-2 top-9 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <JourneyCardMenu
                  journeyId={journey.id}
                  title={journey.title}
                  alreadyArchived={journey.status === "ARCHIVED"}
                  canMoveBack={isReachable && reachableIndex > 0}
                  canMoveForward={isReachable && reachableIndex < reachable.length - 1}
                />
              </div>

              <Link href={`/dashboard/journeys/${journey.id}`} className="block px-2.5 py-2">
                <span className="line-clamp-2 block text-[0.74rem] font-semibold leading-snug text-ink transition-colors group-hover:text-ember">
                  {journey.title}
                </span>
                <span className="mt-0.5 block text-[0.6rem] uppercase tracking-wider text-ink-muted">
                  {journey.chapterCount > 0
                    ? `${journey.chapterCount} ${journey.chapterCount === 1 ? "chapter" : "chapters"} · `
                    : ""}
                  {journey.episodeCount} {journey.episodeCount === 1 ? "episode" : "episodes"}
                  {journey.draftCount > 0 ? (
                    <span className="text-ember"> · {journey.draftCount} draft{journey.draftCount === 1 ? "" : "s"}</span>
                  ) : (
                    ""
                  )}
                </span>
                <span className="mt-0.5 block text-[0.62rem] font-semibold text-ember">
                  Open to edit →
                </span>
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
