import Link from "next/link";
import { JOURNEY_CATEGORIES, categoryToSlug } from "@/lib/constants/categories";
import { getJourneyCountsByCategory } from "@/lib/discovery/categories";

export default async function CategoriesPage() {
  const countByCategory = await getJourneyCountsByCategory();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="font-sans text-xl font-extrabold tracking-tight">
        ZERO
      </Link>

      <h1 className="mt-8 text-2xl font-extrabold tracking-tight">Categories</h1>
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
    </main>
  );
}
