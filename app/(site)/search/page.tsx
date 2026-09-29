import { SearchForm } from "@/components/search/SearchForm";
import { SearchFilters } from "@/components/search/SearchFilters";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { JourneyerCard } from "@/components/profile/JourneyerCard";
import { searchJourneys } from "@/lib/search/searchJourneys";
import { searchCreators } from "@/lib/search/searchCreators";
import { searchPeople } from "@/lib/search/searchPeople";
import { promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import { JOURNEY_CATEGORIES, type JourneyCategory } from "@/lib/constants/categories";
import { JOURNEY_DATE_PRESETS, type JourneyDatePreset } from "@/lib/constants/journeyDatePresets";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { CARD_GRID } from "@/components/ui/cover-card";
import { NOTICE } from "@/components/ui/panel";
import { PageTitle, SectionTitle } from "@/components/ui/heading";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; category?: string | string[]; date?: string | string[] }>;
}) {
  const { q, category: categoryParam, date: dateParam } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const category = (Array.isArray(categoryParam) ? categoryParam[0] : categoryParam) ?? "";
  const date = (Array.isArray(dateParam) ? dateParam[0] : dateParam) ?? "";

  const journeyFilters = {
    category: (JOURNEY_CATEGORIES as readonly string[]).includes(category)
      ? (category as JourneyCategory)
      : undefined,
    datePreset: (JOURNEY_DATE_PRESETS as readonly string[]).includes(date)
      ? (date as JourneyDatePreset)
      : undefined,
  };
  const hasJourneyFilters = journeyFilters.category !== undefined || journeyFilters.datePreset !== undefined;

  await promoteExpiredDiscoveryJourneys();
  // I filtri Journey (categoria/data) funzionano anche senza testo, come su YouTube — solo
  // Creators/People restano legati a una vera ricerca testuale.
  const [journeys, creators] = query || hasJourneyFilters
    ? await Promise.all([searchJourneys(query, journeyFilters), query ? searchCreators(query) : Promise.resolve([])])
    : [[], []];
  // "People" cerca chiunque si sia registrato, non solo chi ha pubblicato un Journey (quello
  // resta "Creators" sopra) — coerente col Follow universale, si può seguire chiunque.
  const people = query ? await searchPeople(query, creators.map((creator) => creator.id)) : [];

  return (
    <main>
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <PageTitle>Search</PageTitle>
        <div className="mt-4 max-w-md">
          <SearchForm defaultValue={query} />
        </div>
        <SearchFilters defaultQuery={query} defaultCategory={category} defaultDatePreset={date} />

        {!query && !hasJourneyFilters && (
          <p className="mt-10 text-sm text-ink-muted">Search for a Journey or a creator, or filter by category and date.</p>
        )}

        {(query || hasJourneyFilters) && journeys.length === 0 && creators.length === 0 && people.length === 0 && (
          <p className={`mt-10 ${NOTICE}`}>
            {query ? `No results for "${query}".` : "No Journeys match these filters."}
          </p>
        )}

        {journeys.length > 0 && (
          <section className="mt-10">
            <SectionTitle>Journeys</SectionTitle>
            <div className={`mt-4 ${CARD_GRID.journey}`}>
              {journeys.map((journey) => (
                <JourneyCard key={journey.id} journey={journey} />
              ))}
            </div>
          </section>
        )}

        {creators.length > 0 && (
          <section className="mt-10">
            <SectionTitle>Creators</SectionTitle>
            <div className={`mt-4 ${CARD_GRID.person}`}>
              {creators.map((creator) => (
                <JourneyerCard key={creator.id} journeyer={creator} />
              ))}
            </div>
          </section>
        )}

        {people.length > 0 && (
          <section className="mt-10">
            <SectionTitle>People</SectionTitle>
            <div className={`mt-4 ${CARD_GRID.person}`}>
              {people.map((person) => (
                <JourneyerCard key={person.id} journeyer={person} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
