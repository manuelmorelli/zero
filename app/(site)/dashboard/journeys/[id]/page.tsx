import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import { getImagePlaybackUrl } from "@/lib/r2";
import { getJourneyPrivateStats } from "@/lib/dashboard/journeyStats";
import { JourneyForm } from "@/components/creator/JourneyForm";
import { JourneyPublishControl } from "@/components/creator/JourneyPublishControl";
import { JourneyHeaderMenu } from "@/components/creator/JourneyHeaderMenu";
import { DashboardPanel } from "@/components/creator/DashboardPanel";
import { ChaptersAndEpisodesPanel } from "@/components/creator/ChaptersAndEpisodesPanel";
import { PrivateStatsPanel } from "@/components/creator/PrivateStatsPanel";
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
  const { creator } = await requireCreator();

  const journey = await prisma.journey.findUnique({ where: { id } });
  if (!journey || journey.creatorId !== creator.id || journey.deletedAt) notFound();

  const rawChapters = await prisma.chapter.findMany({
    where: { journeyId: journey.id, deletedAt: null },
    orderBy: { order: "asc" },
    include: { episodes: { where: { deletedAt: null }, orderBy: { order: "asc" } } },
  });

  const rawLooseEpisodes = await prisma.episode.findMany({
    where: { journeyId: journey.id, chapterId: null, deletedAt: null },
    orderBy: { order: "asc" },
  });

  // posterKey -> link temporaneo di sola lettura, stesso principio di resolveCoverUrl ma per la
  // copertina propria dell'Episodio (vedi lib/actions/episode.ts).
  async function withPosterUrl<T extends { posterKey: string | null }>(episode: T) {
    return { ...episode, posterUrl: episode.posterKey ? await getImagePlaybackUrl(episode.posterKey) : null };
  }

  const [chapters, looseEpisodes] = await Promise.all([
    Promise.all(
      rawChapters.map(async (chapter) => ({
        ...chapter,
        episodes: await Promise.all(chapter.episodes.map(withPosterUrl)),
      }))
    ),
    Promise.all(rawLooseEpisodes.map(withPosterUrl)),
  ]);

  const [coverUrl, stats] = await Promise.all([
    resolveCoverUrl(journey.coverUrl),
    getJourneyPrivateStats(journey.id, journey.viewsCount),
  ]);

  return (
    <main>

      <div className="mx-auto max-w-[1400px] space-y-4 px-5 pb-16 pt-24 md:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{journey.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    journey.status === "PUBLISHED" || journey.status === "DISCOVERY"
                      ? "bg-ember"
                      : "bg-ink-faint"
                  }`}
                  aria-hidden="true"
                />
                {STATUS_LABEL[journey.status] ?? journey.status}
              </span>
              <JourneyPublishControl journeyId={journey.id} status={journey.status} />
              {journey.status !== "DRAFT" && (
                <Link
                  href={`/journeys/${journey.id}`}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
                >
                  View public page →
                </Link>
              )}
              <JourneyHeaderMenu journeyId={journey.id} status={journey.status} />
            </div>
          </div>
          {journey.status === "ARCHIVED" && (
            <p className="mt-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-ink-muted">
              This Journey is archived. It stays visible on your public profile, but it&apos;s no
              longer your active Journey.
            </p>
          )}
        </Reveal>

        <Reveal delayMs={90}>
          <DashboardPanel title="Journey details" className="max-w-3xl">
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
