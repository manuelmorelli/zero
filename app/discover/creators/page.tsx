import { UserPlus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CreatorResultCard } from "@/components/creator/CreatorResultCard";
import { getViewerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRecommendedCreators } from "@/lib/discovery/recommendedCreators";
import { DEMO_CREATORS } from "@/lib/demo/demoContent";

export const metadata = { title: "Creators to follow — Zero" };

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
      <Header />
      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-24 md:px-8">
        <SectionHeading
          icon={<UserPlus className="h-6 w-6" aria-hidden="true" />}
          title="Creators to follow"
          subtitle="People documenting journeys like the ones you follow."
        />

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {displayed.map((creator) => (
            <li key={creator.id}>
              <CreatorResultCard creator={creator} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
