import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { ChapterForm } from "@/components/creator/ChapterForm";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  DISCOVERY: "In Discovery",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export default async function JourneyManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { creator } = await requireCreator();

  const journey = await prisma.journey.findUnique({ where: { id } });
  if (!journey || journey.creatorId !== creator.id) notFound();

  const chapters = await prisma.chapter.findMany({
    where: { journeyId: journey.id, deletedAt: null },
    orderBy: { order: "asc" },
    include: { episodes: { where: { deletedAt: null } } },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/creator" className="font-sans text-xl font-extrabold tracking-tight">
        ZERO
      </Link>

      <div className="mt-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{journey.title}</h1>
          {journey.description && (
            <p className="mt-2 text-sm text-ink-muted">{journey.description}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-semibold text-ink-muted">
          {STATUS_LABEL[journey.status] ?? journey.status}
        </span>
      </div>

      {(journey.category || journey.tags.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {journey.category && (
            <span className="rounded-full bg-surface-2 px-3 py-1 text-xs text-ink-muted">
              {journey.category}
            </span>
          )}
          {journey.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-surface-2 px-3 py-1 text-xs text-ink-muted">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-sm font-semibold text-ink">Chapters</h2>

        <div className="mt-4 space-y-3">
          {chapters.length === 0 && (
            <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
              You haven&apos;t added any chapters yet.
            </p>
          )}
          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/creator/journeys/${journey.id}/chapters/${chapter.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 transition-colors hover:border-ink-muted"
            >
              <div>
                <span className="text-sm font-semibold text-ink">{chapter.title}</span>
                {chapter.description && (
                  <p className="mt-1 text-sm text-ink-muted">{chapter.description}</p>
                )}
              </div>
              <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-semibold text-ink-muted">
                {chapter.episodes.length} {chapter.episodes.length === 1 ? "episode" : "episodes"}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h3 className="text-sm font-semibold text-ink">Add a chapter</h3>
          <div className="mt-4">
            <ChapterForm journeyId={journey.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
