import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_WIDTH, PAGE_SPACING } from "@/components/ui/page-container";

/** Sagoma della pagina Journey: copertina grande + colonna di testo, poi la lista episodi. */
export default function JourneyLoading() {
  return (
    <main className="skeleton-reveal">
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="aspect-video w-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      </div>
    </main>
  );
}
