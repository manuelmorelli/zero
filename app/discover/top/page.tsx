import { Star } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getTopJourneys } from "@/lib/discovery/topJourneys";
import { DEMO_TOP_JOURNEYS } from "@/lib/demo/demoContent";

export const metadata = { title: "Top Journeys — Zero" };

export default async function TopJourneysPage() {
  const session = await getCurrentSession();
  const userId = session?.user.id ?? null;
  const interests = userId
    ? (await prisma.user.findUnique({ where: { id: userId }, select: { interests: true } }))?.interests ?? []
    : [];

  const journeys = await getTopJourneys({ limit: 60, interests });
  const displayed = journeys.length > 0 ? journeys : DEMO_TOP_JOURNEYS;

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-24 md:px-8">
        <SectionHeading
          icon={<Star className="h-6 w-6 fill-current" aria-hidden="true" />}
          title="Top Journeys"
          subtitle="Timeless stories that continue to inspire."
        />

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayed.map((journey) => (
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
                  <p className="px-4 pb-4 text-xs text-ink-muted">
                    {journey.episodesCount} {journey.episodesCount === 1 ? "episode" : "episodes"}
                  </p>
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
