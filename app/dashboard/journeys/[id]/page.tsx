import { notFound } from "next/navigation";
import { Rocket } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import { getJourneyPrivateStats } from "@/lib/dashboard/journeyStats";
import { JourneyForm } from "@/components/creator/JourneyForm";
import { JourneyPublishControl } from "@/components/creator/JourneyPublishControl";
import { JourneyArchiveButton } from "@/components/creator/JourneyArchiveButton";
import { DashboardPanel } from "@/components/creator/DashboardPanel";
import { ChaptersAndEpisodesPanel } from "@/components/creator/ChaptersAndEpisodesPanel";
import { PrivateStatsPanel } from "@/components/creator/PrivateStatsPanel";
import { FirstEpisodeForm } from "@/components/creator/FirstEpisodeForm";
import { Header } from "@/components/layout/Header";
import { Reveal } from "@/components/common/Reveal";
import Link from "next/link";

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
  const { user, creator } = await requireCreator();

  const journey = await prisma.journey.findUnique({ where: { id } });
  if (!journey || journey.creatorId !== creator.id || journey.deletedAt) notFound();

  const chapters = await prisma.chapter.findMany({
    where: { journeyId: journey.id, deletedAt: null },
    orderBy: { order: "asc" },
    include: { episodes: { where: { deletedAt: null }, orderBy: { order: "asc" } } },
  });

  const looseEpisodes = await prisma.episode.findMany({
    where: { journeyId: journey.id, chapterId: null, deletedAt: null },
    orderBy: { order: "asc" },
  });

  const totalEpisodeCount =
    looseEpisodes.length + chapters.reduce((sum, chapter) => sum + chapter.episodes.length, 0);

  const [coverUrl, stats] = await Promise.all([
    resolveCoverUrl(journey.coverUrl),
    getJourneyPrivateStats(journey.id, journey.viewsCount),
  ]);

  return (
    <main>
      <Header />

      <div className="mx-auto max-w-[1400px] space-y-4 px-5 pb-16 pt-24 md:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-[0.72rem] uppercase tracking-[0.18em] text-ember transition-colors hover:text-ink"
              >
                ← All Journeys
              </Link>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{journey.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-ink-muted">
                {STATUS_LABEL[journey.status] ?? journey.status}
              </span>
              <JourneyPublishControl journeyId={journey.id} status={journey.status} />
              {journey.status !== "ARCHIVED" && <JourneyArchiveButton journeyId={journey.id} />}
              {journey.status !== "DRAFT" && (
                <Link
                  href={`/journeys/${journey.id}`}
                  className="text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  View public page →
                </Link>
              )}
              <Link
                href={`/profile/${user.id}`}
                className="text-sm text-ink-muted transition-colors hover:text-ink"
              >
                View Public Profile →
              </Link>
            </div>
          </div>
          {journey.status === "ARCHIVED" && (
            <p className="mt-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-ink-muted">
              This Journey is archived. It stays visible on your public profile, but it&apos;s no
              longer your active Journey.
            </p>
          )}
        </Reveal>

        {totalEpisodeCount === 0 && (
          <Reveal delayMs={60}>
            <DashboardPanel title="Publish your first episode" icon={<Rocket className="h-4 w-4" aria-hidden="true" />}>
              <FirstEpisodeForm journeyId={journey.id} />
              <p className="mt-2 text-[0.72rem] text-ink-muted">
                Two steps: add a title and publish. You can add a cover, duration and chapters at any time.
              </p>
            </DashboardPanel>
          </Reveal>
        )}

        <Reveal delayMs={90}>
          <DashboardPanel title="Journey details">
            <JourneyForm
              journey={{
                id: journey.id,
                title: journey.title,
                description: journey.description,
                category: journey.category,
                tags: journey.tags,
                coverUrl,
              }}
            />
          </DashboardPanel>
        </Reveal>

        <Reveal delayMs={120}>
          <ChaptersAndEpisodesPanel
            journeyId={journey.id}
            chapters={chapters}
            looseEpisodes={looseEpisodes}
            coverUrl={coverUrl}
          />
        </Reveal>

        <Reveal delayMs={150}>
          <PrivateStatsPanel stats={stats} />
        </Reveal>
      </div>
    </main>
  );
}
