import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getEpisodeTimeline } from "@/lib/journey/episodeTimeline";
import { EpisodeTimelineList } from "@/components/journey/EpisodeTimelineList";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function JourneyEpisodesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const journey = await prisma.journey.findUnique({
    where: { id },
    include: { creator: true },
  });

  if (!journey || journey.deletedAt || (journey.status !== "PUBLISHED" && journey.status !== "ARCHIVED"))
    notFound();

  const { groups } = await getEpisodeTimeline(journey.id, { withPlaybackUrls: true });

  return (
    <main>
      <PageHeader />

      <div className="mx-auto max-w-2xl px-6 py-14">
        <Link
          href={`/journeys/${journey.id}`}
          className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          ← {journey.title}
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
            {journey.coverUrl ? (
              <Image src={journey.coverUrl} alt="" fill sizes="64px" className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold tracking-tight">{journey.title}</h1>
            <p className="text-sm text-ink-muted">by {journey.creator.displayName}</p>
          </div>
        </div>

        <div className="mt-10">
          {groups.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
              This Journey doesn&apos;t have any episodes yet.
            </p>
          ) : (
            <EpisodeTimelineList groups={groups} coverUrl={journey.coverUrl} journeyTitle={journey.title} />
          )}
        </div>
      </div>
    </main>
  );
}
