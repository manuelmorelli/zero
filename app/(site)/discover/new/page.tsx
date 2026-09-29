import { Clock } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { getViewerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getNewJourneys } from "@/lib/discovery/newJourneys";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { CARD_GRID } from "@/components/ui/cover-card";

export const metadata = { title: "New Journeys | Zero" };

export default async function NewJourneysPage() {
  const session = await getViewerSession();
  const userId = session?.user.id ?? null;
  const interests = userId
    ? (await prisma.user.findUnique({ where: { id: userId }, select: { interests: true } }))?.interests ?? []
    : [];

  const journeys = await getNewJourneys([], interests, 60);

  return (
    <main>
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <SectionHeading
          page
          icon={<Clock className="h-6 w-6" aria-hidden="true" />}
          title="New Journeys"
          subtitle="Real stories. Real impact."
        />

        <ul className={`mt-6 ${CARD_GRID.journey}`}>
          {journeys.map((journey) => (
            <li key={journey.id}>
              <JourneyCard journey={journey} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
