import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { categoryFromSlug } from "@/lib/constants/categories";
import { LIVE_JOURNEY_STATUSES, promoteExpiredDiscoveryJourneys } from "@/lib/constants/journeyStatus";
import { JourneyCard } from "@/components/journey/JourneyCard";
import { withResolvedCoverUrls } from "@/lib/media/resolveCoverUrl";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = categoryFromSlug(slug);
  if (!category) notFound();

  await promoteExpiredDiscoveryJourneys();
  const rawJourneys = await prisma.journey.findMany({
    where: { category, status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null },
    orderBy: { publishedAt: "desc" },
    include: { creator: true },
  });
  const journeys = await withResolvedCoverUrls(rawJourneys);

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-2xl px-6 pb-16 pt-24">
        <p className="text-sm font-semibold text-ink-muted">
          <Link href="/categories" className="hover:text-ink transition-colors">
            Journeys
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{category}</h1>

        <div className="mt-8 space-y-3">
          {journeys.length === 0 && (
            <p className="rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
              No Journeys published in this category yet.
            </p>
          )}
          {journeys.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              {journeys.map((journey) => (
                <JourneyCard
                  key={journey.id}
                  journey={{
                    id: journey.id,
                    title: journey.title,
                    coverUrl: journey.coverUrl,
                    category: journey.category,
                    creator: { displayName: journey.creator.displayName },
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
