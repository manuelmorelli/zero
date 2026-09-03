import { Compass } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { getDiscoveringNowJourneys } from "@/lib/discovery/discoveringNow";

export const metadata = { title: "Discovering Now — Zero" };

export default async function DiscoveringNowPage() {
  const journeys = await getDiscoveringNowJourneys(60);

  return (
    <main>
      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-24 md:px-8">
        <SectionHeading
          icon={<Compass className="h-6 w-6" aria-hidden="true" />}
          title="Discovering Now"
          subtitle="Brand new Journeys, shown to everyone — not just people who already follow this topic."
        />

        {journeys.length === 0 ? (
          <p className="mt-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-muted">
            No Journey is in Discovery Phase right now.
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {journeys.map((journey) => (
              <li key={journey.id}>
                <JourneyCard
                  journey={{
                    id: journey.id,
                    title: journey.title,
                    coverUrl: journey.coverUrl,
                    category: journey.category,
                    creator: { displayName: journey.creatorName },
                  }}
                  footer={
                    <p className="mt-2 text-xs text-ink-muted">
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
