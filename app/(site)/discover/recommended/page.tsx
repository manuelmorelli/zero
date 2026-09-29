import { Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { getViewerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRecommendedJourneys } from "@/lib/discovery/recommendedJourneys";
import { DEMO_JOURNEYS } from "@/lib/demo/demoJourneys";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { CARD_GRID } from "@/components/ui/cover-card";

export const metadata = { title: "Recommended for You | Zero" };

export default async function RecommendedJourneysPage() {
  const session = await getViewerSession();
  const userId = session?.user.id ?? null;
  const interests = userId
    ? (await prisma.user.findUnique({ where: { id: userId }, select: { interests: true } }))?.interests ?? []
    : [];

  const journeys = await getRecommendedJourneys({ userId, interests, limit: 60 });
  const displayed = journeys.length > 0 ? journeys : DEMO_JOURNEYS;

  return (
    <main>
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <SectionHeading
          page
          icon={<Sparkles className="h-6 w-6" aria-hidden="true" />}
          title="Recommended for You"
          subtitle="Picked based on who you follow."
        />

        <ul className={`mt-6 ${CARD_GRID.journey}`}>
          {displayed.map((journey) => (
            <li key={journey.id}>
              <JourneyCard journey={journey} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
