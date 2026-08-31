import { Header } from "@/components/layout/Header";
import { JourneysBrowser } from "@/components/journey/JourneysBrowser";
import { getJourneysByCategory } from "@/lib/discovery/journeysByCategory";
import { promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";

export default async function JourneysPage() {
  await promoteExpiredDiscoveryJourneys();
  const rows = await getJourneysByCategory();

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-24 md:px-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Journeys</h1>
        <p className="mt-2 text-sm text-ink-muted">Browse Journeys by category.</p>

        <div className="mt-8">
          {rows.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
              No Journeys published yet.
            </p>
          ) : (
            <JourneysBrowser rows={rows} />
          )}
        </div>
      </div>
    </main>
  );
}
