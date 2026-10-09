import { Skeleton, SkeletonCardRow } from "@/components/ui/skeleton";
import { PAGE_WIDTH } from "@/components/ui/page-container";

/** Sagoma della Home: segue l'Hero e le righe scorrevoli di card (Recommended, Discovering Now,
 * Top Journeys, Latest Videos), così la pagina non appare bianca durante il caricamento. */
export default function HomeLoading() {
  return (
    <main className="skeleton-reveal">
      <div className="relative md:pt-[calc(3.85rem+1cm)]">
        <div className={`${PAGE_WIDTH.wide} py-4`}>
          <Skeleton className="aspect-[16/7] w-full" />
        </div>
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={`${PAGE_WIDTH.wide} space-y-4 py-4`}>
          <Skeleton className="h-6 w-48" />
          <SkeletonCardRow />
        </div>
      ))}
    </main>
  );
}
