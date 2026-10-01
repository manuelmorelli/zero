import { JourneysBrowser } from "@/components/journey/JourneysBrowser";
import { getJourneysByCategory } from "@/lib/discovery/journeysByCategory";
import { getMostCompletedJourneys } from "@/lib/discovery/mostCompletedJourneys";
import { promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/heading";
import { NOTICE } from "@/components/ui/panel";
import { HorizontalScrollRow } from "@/components/common/HorizontalScrollRow";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { CARD_ROW_ITEM } from "@/components/ui/cover-card";

export default async function JourneysPage() {
  await promoteExpiredDiscoveryJourneys();
  const [rows, mostCompleted] = await Promise.all([getJourneysByCategory(), getMostCompletedJourneys()]);

  return (
    <main>
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <PageTitle>Journeys</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">Browse Journeys by category.</p>

        <div className="mt-8 space-y-10">
          {mostCompleted.length > 0 && (
            <HorizontalScrollRow title="Most Completed" subtitle="Journeys viewers watch all the way through.">
              {mostCompleted.map((journey) => (
                <JourneyCard key={journey.id} journey={journey} className={CARD_ROW_ITEM.journey} />
              ))}
            </HorizontalScrollRow>
          )}

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
