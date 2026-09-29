import { JourneyersBrowser } from "@/components/profile/JourneyersBrowser";
import { getJourneyersByCategory, getNewJourneyers } from "@/lib/discovery/journeyersByCategory";
import { promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";
import { NOTICE } from "@/components/ui/panel";

export default async function JourneyersPage() {
  await promoteExpiredDiscoveryJourneys();
  const [newJourneyers, rows] = await Promise.all([getNewJourneyers(), getJourneyersByCategory()]);

  return (
    <main>
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <PageTitle>Journeyers</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">Browse the people documenting their journeys, by category.</p>

        <div className="mt-8">
          {newJourneyers.length === 0 && rows.length === 0 ? (
            <p className={NOTICE}>
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
