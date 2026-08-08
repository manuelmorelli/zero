import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { categoryFromSlug } from "@/lib/constants/categories";
import { JourneyCard } from "@/components/journey/JourneyCard";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const journeys = await prisma.journey.findMany({
    where: { category, status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    include: { creator: { include: { _count: { select: { followers: true } } } } },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="font-sans text-xl font-extrabold tracking-tight">
        ZERO
      </Link>

      <p className="mt-8 text-sm font-semibold text-ink-muted">
        <Link href="/categories" className="hover:text-ink transition-colors">
          Categories
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
                  followersCount: journey.creator._count.followers,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
