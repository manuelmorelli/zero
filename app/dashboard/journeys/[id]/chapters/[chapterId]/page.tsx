import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { ChapterForm } from "@/components/creator/ChapterForm";
import { EpisodeForm } from "@/components/creator/EpisodeForm";
import { EpisodeList } from "@/components/creator/EpisodeList";
import { deleteChapter } from "@/lib/actions/chapter";
import { Header } from "@/components/layout/Header";

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

  const chapters = await prisma.chapter.findMany({
    where: { journeyId: id, deletedAt: null },
    orderBy: { order: "asc" },
    select: { id: true, title: true },
  });

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-2xl px-6 pb-16 pt-24">
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

        <div className="mt-4">
          <EpisodeList journeyId={id} chapters={chapters} episodes={chapter.episodes} />
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h3 className="text-sm font-semibold text-ink">Add an episode</h3>
          <div className="mt-4">
            <EpisodeForm journeyId={id} chapters={chapters} defaultChapterId={chapter.id} />
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}