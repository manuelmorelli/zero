import { Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getNewJourneys } from "@/lib/discovery/newJourneys";

export const metadata = { title: "New Journeys — Zero" };

export default async function NewJourneysPage() {
  const session = await getCurrentSession();
  const userId = session?.user.id ?? null;
  const interests = userId
    ? (await prisma.user.findUnique({ where: { id: userId }, select: { interests: true } }))?.interests ?? []
    : [];

  const journeys = await getNewJourneys([], interests, 60);

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-24 md:px-8">
        <SectionHeading
          icon={<Clock className="h-6 w-6" aria-hidden="true" />}
          title="New Journeys"
          subtitle="Real stories. Real impact."
        />

        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
