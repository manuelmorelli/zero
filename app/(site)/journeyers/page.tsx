import { JourneyersBrowser } from "@/components/profile/JourneyersBrowser";
import { getJourneyersByCategory, getNewJourneyers } from "@/lib/discovery/journeyersByCategory";
import { promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";

export default async function JourneyersPage() {
  await promoteExpiredDiscoveryJourneys();
  const [newJourneyers, rows] = await Promise.all([getNewJourneyers(), getJourneyersByCategory()]);

  return (
    <main>
      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-24 md:px-8">
        <h1 className="text-xl font-bold tracking-tight">Journeyers</h1>
        <p className="mt-2 text-sm text-ink-muted">Browse the people documenting their journeys, by category.</p>

        <div className="mt-8">
          {newJourneyers.length === 0 && rows.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-muted">
              No Journeyers yet.
            </p>
          ) : (
            <JourneyersBrowser newJourneyers={newJourneyers} rows={rows} />
          )}
        </div>
      </div>
    </main>
  );
}
