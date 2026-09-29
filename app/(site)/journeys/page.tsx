import { JourneysBrowser } from "@/components/journey/JourneysBrowser";
import { getJourneysByCategory } from "@/lib/discovery/journeysByCategory";
import { promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";
import { NOTICE } from "@/components/ui/panel";

export default async function JourneysPage() {
  await promoteExpiredDiscoveryJourneys();
  const rows = await getJourneysByCategory();

  return (
    <main>
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <PageTitle>Journeys</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">Browse Journeys by category.</p>

        <div className="mt-8">
          {rows.length === 0 ? (
            <p className={NOTICE}>
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
