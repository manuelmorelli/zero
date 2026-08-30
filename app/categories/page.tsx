import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { JOURNEY_CATEGORIES, categoryToSlug } from "@/lib/constants/categories";
import { getJourneyCountsByCategory } from "@/lib/discovery/categories";
import { promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";

export default async function CategoriesPage() {
  await promoteExpiredDiscoveryJourneys();
  const countByCategory = await getJourneyCountsByCategory();

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Journeys</h1>
        <p className="mt-2 text-sm text-ink-muted">Browse Journeys by category.</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {JOURNEY_CATEGORIES.map((category) => {
            const count = countByCategory.get(category) ?? 0;
            return (
              <Link
                key={category}
                href={`/categories/${categoryToSlug(category)}`}
                className="rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-muted"
              >
                {category}
                <span className="ml-2 text-ink-faint">{count}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
