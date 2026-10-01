import { Compass } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { getDiscoveringNowJourneys } from "@/lib/discovery/discoveringNow";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { CARD_GRID } from "@/components/ui/cover-card";
import { NOTICE } from "@/components/ui/panel";

export const metadata = { title: "Discovering Now | Zero" };

export default async function DiscoveringNowPage() {
  const journeys = await getDiscoveringNowJourneys(60);

  return (
    <main>
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <SectionHeading
          page
          icon={<Compass className="h-6 w-6" aria-hidden="true" />}
          title="Discovering Now"
          subtitle="Brand new Journeys, shown to everyone, not just people who already follow this topic."
        />

        {journeys.length === 0 ? (
          <p className={`mt-6 ${NOTICE}`}>
            No Journey is in Discovery Phase right now.
          </p>
        ) : (
          <ul className={`mt-6 ${CARD_GRID.journey}`}>
            {journeys.map((journey) => (
              <li key={journey.id}>
                <JourneyCard
                  journey={{
                    id: journey.id,
                    title: journey.title,
                    coverUrl: journey.coverUrl,
                    category: journey.category,
                    creator: { displayName: journey.creatorName, avatarUrl: journey.creatorAvatarUrl },
                  }}
                  footer={
                    <p className="mt-2 text-sm text-ink-muted">
                      {journey.daysLeft} {journey.daysLeft === 1 ? "day" : "days"} left in Discovery
                    </p>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
