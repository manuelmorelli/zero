import { Skeleton, SkeletonCardRow } from "@/components/ui/skeleton";
import { PAGE_WIDTH, PAGE_SPACING } from "@/components/ui/page-container";

/** Sagoma del Profilo: intestazione (foto + nome) seguita dalla griglia dei Journey. */
export default function ProfileLoading() {
  return (
    <main className="skeleton-reveal">
      <Skeleton className="aspect-[16/6] w-full rounded-none" />

      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING} space-y-6`}>
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>

        <SkeletonCardRow />
      </div>
    </main>
  );
}
