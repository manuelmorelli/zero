import { Flame } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SectionHeading } from "@/components/common/SectionHeading";
import { MomentJourneyCard } from "@/components/journey/MomentJourneyCard";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRecommendedJourneys } from "@/lib/discovery/recommendedJourneys";
import { DEMO_JOURNEYS } from "@/lib/demo/demoJourneys";

export const metadata = { title: "Journeys of the Moment — Zero" };

export default async function MomentJourneysPage() {
  const session = await getCurrentSession();
  const userId = session?.user.id ?? null;
  const interests = userId
    ? (await prisma.user.findUnique({ where: { id: userId }, select: { interests: true } }))?.interests ?? []
    : [];

  const journeys = await getRecommendedJourneys({ userId, interests, limit: 60 });
  const displayed = journeys.length > 0 ? journeys : DEMO_JOURNEYS;

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-24 md:px-8">
        <SectionHeading
          icon={<Flame className="h-6 w-6" aria-hidden="true" />}
          title="Journeys of the Moment"
          subtitle="The most followed and impactful journeys right now."
        />

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayed.map((journey, index) => (
            <li key={journey.id}>
              <MomentJourneyCard journey={journey} rank={index + 1} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
