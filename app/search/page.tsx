import { Header } from "@/components/layout/Header";
import { SearchForm } from "@/components/search/SearchForm";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { CreatorResultCard } from "@/components/creator/CreatorResultCard";
import { PersonResultCard } from "@/components/profile/PersonResultCard";
import { searchJourneys } from "@/lib/search/searchJourneys";
import { searchCreators } from "@/lib/search/searchCreators";
import { searchPeople } from "@/lib/search/searchPeople";
import { promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  await promoteExpiredDiscoveryJourneys();
  const [journeys, creators] = query
    ? await Promise.all([searchJourneys(query), searchCreators(query)])
    : [[], []];
  // "People" cerca chiunque si sia registrato, non solo chi ha pubblicato un Journey (quello
  // resta "Creators" sopra) — coerente col Follow universale, si può seguire chiunque.
  const people = query ? await searchPeople(query, creators.map((creator) => creator.id)) : [];

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Search</h1>
        <div className="mt-4 max-w-md">
          <SearchForm defaultValue={query} />
        </div>

        {!query && <p className="mt-10 text-sm text-ink-muted">Search for a Journey or a creator.</p>}

        {query && journeys.length === 0 && creators.length === 0 && people.length === 0 && (
          <p className="mt-10 rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
            {`No results for "${query}".`}
          </p>
        )}

        {journeys.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold tracking-tight">Journeys</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {journeys.map((journey) => (
                <JourneyCard key={journey.id} journey={journey} />
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

        {people.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold tracking-tight">People</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((person) => (
                <PersonResultCard key={person.id} person={person} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
