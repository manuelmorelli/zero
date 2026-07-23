import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PublicJourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const journey = await prisma.journey.findUnique({
    where: { id },
    include: {
      creator: true,
      chapters: {
        where: { deletedAt: null },
        orderBy: { order: "asc" },
        include: {
          episodes: { where: { deletedAt: null }, orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!journey || journey.status !== "PUBLISHED") notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="font-sans text-xl font-extrabold tracking-tight">
        ZERO
      </Link>

      <h1 className="mt-8 text-2xl font-extrabold tracking-tight">{journey.title}</h1>
      <p className="mt-2 text-sm text-ink-muted">by {journey.creator.displayName}</p>

      {journey.description && (
        <p className="mt-4 text-sm text-ink-muted">{journey.description}</p>
      )}

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

      <div className="mt-10 space-y-8">
        {journey.chapters.length === 0 && (
          <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
            This Journey doesn&apos;t have any chapters yet.
          </p>
        )}

        {journey.chapters.map((chapter) => (
          <div key={chapter.id}>
            <h2 className="text-sm font-semibold text-ink">{chapter.title}</h2>
            {chapter.description && (
              <p className="mt-1 text-sm text-ink-muted">{chapter.description}</p>
            )}

            <div className="mt-4 space-y-3">
              {chapter.episodes.length === 0 && (
                <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
                  No episodes yet.
                </p>
              )}
              {chapter.episodes.map((episode) => (
                <div key={episode.id} className="rounded-xl border border-border bg-surface p-5">
                  <p className="text-xs text-ink-faint">
                    {episode.occurredAt.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-ink">{episode.title}</h3>
                  {episode.caption && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{episode.caption}</p>
                  )}
                  {episode.videoUrl && (
                    <a
                      href={episode.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm font-medium text-ink underline underline-offset-2"
                    >
                      Watch video
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}