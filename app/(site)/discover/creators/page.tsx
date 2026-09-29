import { UserPlus } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JourneyerCard } from "@/components/profile/JourneyerCard";
import { getViewerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRecommendedCreators } from "@/lib/discovery/recommendedCreators";
import { DEMO_CREATORS } from "@/lib/demo/demoContent";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { CARD_GRID } from "@/components/ui/cover-card";

export const metadata = { title: "Creators to Follow | Zero" };

export default async function RecommendedCreatorsPage() {
  const session = await getViewerSession();
  const userId = session?.user.id ?? null;
  const interests = userId
    ? (await prisma.user.findUnique({ where: { id: userId }, select: { interests: true } }))?.interests ?? []
    : [];

  const creators = await getRecommendedCreators({ userId, interests, limit: 60 });
  const displayed = creators.length > 0 ? creators : DEMO_CREATORS;

  return (
    <main>
      <div className={`${PAGE_WIDTH.wide} ${PAGE_SPACING}`}>
        <SectionHeading
          page
          icon={<UserPlus className="h-6 w-6" aria-hidden="true" />}
          title="Creators to Follow"
          subtitle="People documenting journeys like the ones you follow."
        />

        <ul className={`mt-6 ${CARD_GRID.person}`}>
          {displayed.map((creator) => (
            <li key={creator.id}>
              <JourneyerCard journeyer={creator} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
