import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { ChapterForm } from "@/components/creator/ChapterForm";
import { JourneyForm } from "@/components/creator/JourneyForm";
import { JourneyPublishControl } from "@/components/creator/JourneyPublishControl";
import { moveChapterDown, moveChapterUp } from "@/lib/actions/chapter";

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
      <Link href="/dashboard" className="font-sans text-xl font-extrabold tracking-tight">
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

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <JourneyPublishControl journeyId={journey.id} status={journey.status} />
        {journey.status === "PUBLISHED" && (
          <Link
            href={`/journeys/${journey.id}`}
            className="text-sm font-medium text-ink underline underline-offset-2"
          >
            View public page →
          </Link>
        )}
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

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-ink">Edit Journey</h2>
        <div className="mt-4">
          <JourneyForm
            journey={{
              id: journey.id,
              title: journey.title,
              description: journey.description,
              category: journey.category,
              tags: journey.tags,
            }}
          />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold text-ink">Chapters</h2>

        <div className="mt-4 space-y-3">
          {chapters.length === 0 && (
            <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
              You haven&apos;t added any chapters yet.
            </p>
          )}
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-ink-muted"
            >
              <Link
                href={`/dashboard/journeys/${journey.id}/chapters/${chapter.id}`}
                className="min-w-0 flex-1"
              >
                <span className="text-sm font-semibold text-ink">{chapter.title}</span>
                {chapter.description && (
                  <p className="mt-1 text-sm text-ink-muted">{chapter.description}</p>
                )}
              </Link>
              <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-ink-muted">
                  {chapter.episodes.length} {chapter.episodes.length === 1 ? "episode" : "episodes"}
                </span>
                <form action={moveChapterUp}>
                  <input type="hidden" name="chapterId" value={chapter.id} />
                  <button
                    type="submit"
                    disabled={index === 0}
                    className="text-xs font-medium text-ink-muted hover:text-ink disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveChapterDown}>
                  <input type="hidden" name="chapterId" value={chapter.id} />
                  <button
                    type="submit"
                    disabled={index === chapters.length - 1}
                    className="text-xs font-medium text-ink-muted hover:text-ink disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
              </div>
            </div>
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
