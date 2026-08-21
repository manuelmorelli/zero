import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { DashboardPanel } from "@/components/creator/DashboardPanel";
import { JourneyGrid, type GridJourney } from "@/components/creator/JourneyGrid";
import { UpdateForm } from "@/components/creator/UpdateForm";
import { UpdateItem } from "@/components/creator/UpdateItem";
import { Header } from "@/components/layout/Header";
import { Reveal } from "@/components/common/Reveal";
import { withResolvedCoverUrls } from "@/lib/media/resolveCoverUrl";
import { getOwnUpdatesForDashboard } from "@/lib/updates";

export default async function CreatorDashboardPage() {
  const { user, creator } = await requireCreator();
  const ownUpdates = await getOwnUpdatesForDashboard(creator.id);
  const rawJourneys = await prisma.journey.findMany({
    where: { creatorId: creator.id, deletedAt: null },
    orderBy: { order: "asc" },
  });
  const journeys = await withResolvedCoverUrls(rawJourneys);
  // Un creator può avere più Journey attivi (non archiviati) in parallelo — vedi
  // 00-project-context.md, sezione "Archiviazione del Journey".
  const activeJourneys = journeys.filter((journey) => journey.status !== "ARCHIVED");
  const archivedJourneys = journeys.filter((journey) => journey.status === "ARCHIVED");

  const [chapterCounts, episodeCounts, draftCounts] = await Promise.all([
    Promise.all(
      activeJourneys.map((journey) =>
        prisma.chapter.count({ where: { journeyId: journey.id, deletedAt: null } })
      )
    ),
    Promise.all(
      activeJourneys.map((journey) =>
        prisma.episode.count({
          where: {
            deletedAt: null,
            journeyId: journey.id,
            OR: [{ chapterId: null }, { chapter: { deletedAt: null } }],
          },
        })
      )
    ),
    Promise.all(
      activeJourneys.map((journey) =>
        prisma.episode.count({
          where: {
            deletedAt: null,
            journeyId: journey.id,
            publishedAt: null,
            OR: [{ chapterId: null }, { chapter: { deletedAt: null } }],
          },
        })
      )
    ),
  ]);

  const gridJourneys: GridJourney[] = activeJourneys.map((journey, index) => ({
    id: journey.id,
    title: journey.title,
    coverUrl: journey.coverUrl,
    category: journey.category,
    status: journey.status,
    chapterCount: chapterCounts[index] ?? 0,
    episodeCount: episodeCounts[index] ?? 0,
    draftCount: draftCounts[index] ?? 0,
  }));

  return (
    <main>
      <Header />

      <div className="mx-auto max-w-[1400px] space-y-4 px-5 pb-16 pt-24 md:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-ember">Creator area</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Hi, {creator.displayName}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/${user.id}`}
                className="text-sm text-ink-muted transition-colors hover:text-ink"
              >
                View Public Profile →
              </Link>
              <Link
                href="/dashboard/journeys/new"
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
              >
                New Journey
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delayMs={60}>
          <DashboardPanel title="Your Journeys">
            {gridJourneys.length === 0 ? (
              <p className="rounded-xl border border-border bg-surface-2 p-6 text-sm text-ink-muted">
                You don&apos;t have an active Journey yet. Start one to begin sharing your story.
              </p>
            ) : (
              <JourneyGrid journeys={gridJourneys} />
            )}
          </DashboardPanel>
        </Reveal>

        <Reveal delayMs={80}>
          <DashboardPanel title="Your Updates">
            <UpdateForm />
            {ownUpdates.length > 0 && (
              <div className="mt-4 space-y-3">
                {ownUpdates.map((update) => (
                  <UpdateItem key={update.id} update={update} />
                ))}
              </div>
            )}
          </DashboardPanel>
        </Reveal>

        {archivedJourneys.length > 0 && (
          <Reveal delayMs={90}>
            <DashboardPanel title="Archived Journeys">
              <p className="mb-3 text-xs text-ink-muted">
                Archived Journeys stay visible on your public profile until deleted.
              </p>
              <div className="space-y-3">
                {archivedJourneys.map((journey) => (
                  <Link
                    key={journey.id}
                    href={`/dashboard/journeys/${journey.id}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-2 p-5 transition-colors hover:border-ink-muted"
                  >
                    <span className="text-sm font-semibold text-ink">{journey.title}</span>
                    <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      Archived
                    </span>
                  </Link>
                ))}
              </div>
            </DashboardPanel>
          </Reveal>
        )}
      </div>
    </main>
  );
}
