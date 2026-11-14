import { Star } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { getViewerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getTopJourneys } from "@/lib/discovery/topJourneys";
import { DEMO_TOP_JOURNEYS } from "@/lib/demo/demoContent";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { CARD_GRID } from "@/components/ui/cover-card";
import { LoadMoreLink } from "@/components/common/LoadMoreLink";
import { parseShown, splitPage } from "@/lib/discovery/pagination";

export const metadata = { title: "Most Trusted | Zero" };

export default async function TopJourneysPage({ searchParams }: { searchParams: Promise<{ shown?: string }> }) {
  const shown = parseShown((await searchParams).shown);
  const session = await getViewerSession();
  const userId = session?.user.id ?? null;
  const interests = userId
    ? (await prisma.user.findUnique({ where: { id: userId }, select: { interests: true } }))?.interests ?? []
    : [];

  const journeys = await getTopJourneys({ limit: shown + 1, interests });
  const { visible: displayed, hasMore } = splitPage(journeys.length > 0 ? journeys : DEMO_TOP_JOURNEYS, shown);

  return (
    <main>
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <SectionHeading
          page
          icon={<Star className="h-6 w-6 fill-current" aria-hidden="true" />}
          title="Most Trusted"
          subtitle="Timeless stories that continue to inspire."
        />

        <ul className={`mt-6 ${CARD_GRID.journey}`}>
          {displayed.map((journey) => (
            <li key={journey.id}>
              <JourneyCard
                journey={{
                  id: journey.id,
                  title: journey.title,
                  coverUrl: journey.coverUrl,
                  category: journey.category,
                  journeyScore: journey.journeyScore,
                  episodeCount: journey.episodesCount,
                  creator: { userId: journey.creatorUserId, displayName: journey.creatorName, avatarUrl: journey.creatorAvatarUrl },
                }}
              />
            </li>
          ))}
        </ul>
        <LoadMoreLink href="/discover/top" shown={shown} hasMore={hasMore} />
      </div>
    </main>
  );
}
