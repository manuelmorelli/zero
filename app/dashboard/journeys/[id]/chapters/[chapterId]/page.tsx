import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { ChapterForm } from "@/components/creator/ChapterForm";
import { EpisodeForm } from "@/components/creator/EpisodeForm";
import { EpisodeItem } from "@/components/creator/EpisodeItem";
import { deleteChapter } from "@/lib/actions/chapter";

export default async function ChapterManagePage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id, chapterId } = await params;
  const { creator } = await requireCreator();

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      journey: true,
      episodes: { where: { deletedAt: null }, orderBy: { order: "asc" } },
    },
  });
  if (!chapter || chapter.journeyId !== id || chapter.journey.creatorId !== creator.id) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href={`/dashboard/journeys/${id}`} className="text-sm font-medium text-ink-muted hover:text-ink">
        ← {chapter.journey.title}
      </Link>

      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{chapter.title}</h1>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-ink">Edit chapter</h2>
        <div className="mt-4">
          <ChapterForm journeyId={id} chapter={{ id: chapter.id, title: chapter.title, description: chapter.description }} />
        </div>
        <form action={deleteChapter} className="mt-4">
          <input type="hidden" name="chapterId" value={chapter.id} />
          <button type="submit" className="text-xs font-medium text-danger hover:opacity-80">
            Delete chapter
          </button>
        </form>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold text-ink">Episodes</h2>

        <div className="mt-4 space-y-3">
          {chapter.episodes.length === 0 && (
            <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
              You haven&apos;t added any episodes yet.
            </p>
          )}
          {chapter.episodes.map((episode, index) => (
            <EpisodeItem
              key={episode.id}
              chapterId={chapter.id}
              episode={episode}
              isFirst={index === 0}
              isLast={index === chapter.episodes.length - 1}
            />
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h3 className="text-sm font-semibold text-ink">Add an episode</h3>
          <div className="mt-4">
            <EpisodeForm chapterId={chapter.id} />
          </div>
        </div>
      </div>
    </main>
  );
}