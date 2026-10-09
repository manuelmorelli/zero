import { Skeleton, SkeletonCardRow } from "@/components/ui/skeleton";
import { PAGE_WIDTH, PAGE_SPACING } from "@/components/ui/page-container";

/** Sagoma della Dashboard: titolo, pannello statistiche, griglia dei Journey del creator. */
export default function DashboardLoading() {
  return (
    <main className="skeleton-reveal">
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING} space-y-4`}>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-28 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-36" />
          <SkeletonCardRow format="episode" count={4} />
        </div>
      </div>
    </main>
  );
}
