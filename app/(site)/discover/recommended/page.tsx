import { Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { getViewerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRecommendedJourneys } from "@/lib/discovery/recommendedJourneys";
import { DEMO_JOURNEYS } from "@/lib/demo/demoJourneys";

export const metadata = { title: "Recommended for you — Zero" };

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
      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-24 md:px-8">
        <SectionHeading
          icon={<Sparkles className="h-6 w-6" aria-hidden="true" />}
          title="Recommended for you"
          subtitle="Picked based on who you follow."
        />

        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
