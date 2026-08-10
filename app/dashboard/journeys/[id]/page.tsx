import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { ChapterForm } from "@/components/creator/ChapterForm";
import { ChapterList } from "@/components/creator/ChapterList";
import { EpisodeForm } from "@/components/creator/EpisodeForm";
import { EpisodeList } from "@/components/creator/EpisodeList";
import { JourneyForm } from "@/components/creator/JourneyForm";
import { JourneyPublishControl } from "@/components/creator/JourneyPublishControl";
import { JourneyArchiveButton } from "@/components/creator/JourneyArchiveButton";

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

  const looseEpisodes = await prisma.episode.findMany({
    where: { journeyId: journey.id, chapterId: null, deletedAt: null },
    orderBy: { order: "asc" },
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

      {journey.status === "ARCHIVED" && (
        <p className="mt-4 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-ink-muted">
          This Journey is archived. It stays visible on your public profile, but it&apos;s no
          longer your active Journey.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <JourneyPublishControl journeyId={journey.id} status={journey.status} />
        {journey.status !== "ARCHIVED" && <JourneyArchiveButton journeyId={journey.id} />}
        {journey.status !== "DRAFT" && (
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

        <ChapterList
          journeyId={journey.id}
          chapters={chapters.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            description: chapter.description,
            episodeCount: chapter.episodes.length,
          }))}
        />

        <div className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h3 className="text-sm font-semibold text-ink">Add a chapter</h3>
          <div className="mt-4">
            <ChapterForm journeyId={journey.id} />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold text-ink">Episodes</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Episodes without a chapter, shown here in a simple chronological list.
        </p>

        <div className="mt-4">
          <EpisodeList
            journeyId={journey.id}
            chapters={chapters.map((chapter) => ({ id: chapter.id, title: chapter.title }))}
            episodes={looseEpisodes}
          />
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h3 className="text-sm font-semibold text-ink">Add an episode</h3>
          <div className="mt-4">
            <EpisodeForm
              journeyId={journey.id}
              chapters={chapters.map((chapter) => ({ id: chapter.id, title: chapter.title }))}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
