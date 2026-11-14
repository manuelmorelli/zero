import { UserPlus } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JourneyerCard } from "@/components/profile/JourneyerCard";
import { getViewerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRecommendedCreators } from "@/lib/discovery/recommendedCreators";
import { DEMO_CREATORS } from "@/lib/demo/demoContent";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { CARD_GRID } from "@/components/ui/cover-card";
import { LoadMoreLink } from "@/components/common/LoadMoreLink";
import { parseShown, splitPage } from "@/lib/discovery/pagination";

export const metadata = { title: "Journeyers to Follow | Zero" };

export default async function RecommendedCreatorsPage({ searchParams }: { searchParams: Promise<{ shown?: string }> }) {
  const shown = parseShown((await searchParams).shown);
  const session = await getViewerSession();
  const userId = session?.user.id ?? null;
  const interests = userId
    ? (await prisma.user.findUnique({ where: { id: userId }, select: { interests: true } }))?.interests ?? []
    : [];

  const creators = await getRecommendedCreators({ userId, interests, limit: shown + 1 });
  const { visible: displayed, hasMore } = splitPage(creators.length > 0 ? creators : DEMO_CREATORS, shown);

  return (
    <main>
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <SectionHeading
          page
          icon={<UserPlus className="h-6 w-6" aria-hidden="true" />}
          title="Journeyers to Follow"
          subtitle="People documenting journeys like the ones you follow."
        />

        <ul className={`mt-6 ${CARD_GRID.person}`}>
          {displayed.map((creator) => (
            <li key={creator.id}>
              <JourneyerCard journeyer={creator} />
            </li>
          ))}
        </ul>
        <LoadMoreLink href="/discover/creators" shown={shown} hasMore={hasMore} />
      </div>
    </main>
  );
}
