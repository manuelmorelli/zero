import Link from "next/link";
import { SearchForm } from "@/components/search/SearchForm";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { CreatorResultCard } from "@/components/creator/CreatorResultCard";
import { searchJourneys } from "@/lib/search/searchJourneys";
import { searchCreators } from "@/lib/search/searchCreators";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  const [journeys, creators] = query
    ? await Promise.all([searchJourneys(query), searchCreators(query)])
    : [[], []];

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link href="/" className="font-sans text-xl font-extrabold tracking-tight">
        ZERO
      </Link>

      <h1 className="mt-8 text-2xl font-extrabold tracking-tight">Search</h1>
      <div className="mt-4 max-w-md">
        <SearchForm defaultValue={query} />
      </div>

      {!query && <p className="mt-10 text-sm text-ink-muted">Search for a Journey or a creator.</p>}

      {query && journeys.length === 0 && creators.length === 0 && (
        <p className="mt-10 rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
          {`No results for "${query}".`}
        </p>
      )}

      {journeys.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">Journeys</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {journeys.map((journey) => (
              <Link key={journey.id} href={`/journeys/${journey.id}`}>
                <JourneyCard journey={journey} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {creators.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">Creators</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <CreatorResultCard key={creator.id} creator={creator} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
