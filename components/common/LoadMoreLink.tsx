import Link from "next/link";
import { BUTTON_VARIANTS } from "@/components/ui/button";
import { DISCOVER_PAGE_STEP } from "@/lib/discovery/pagination";

/** "Load more" in fondo a una pagina completa: ricarica la stessa pagina con altre card, restando dov'era. */
export function LoadMoreLink({ href, shown, hasMore }: { href: string; shown: number; hasMore: boolean }) {
  if (!hasMore) return null;
  return (
    <div className="mt-8 flex justify-center">
      <Link href={`${href}?shown=${shown + DISCOVER_PAGE_STEP}`} scroll={false} className={BUTTON_VARIANTS.secondary}>
        Load more
      </Link>
    </div>
  );
}
