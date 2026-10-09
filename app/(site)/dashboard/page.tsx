import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { DashboardPanel } from "@/components/creator/DashboardPanel";
import { JourneyGrid, type GridJourney } from "@/components/creator/JourneyGrid";
import { PrivateStatsPanel } from "@/components/creator/PrivateStatsPanel";
import { Reveal } from "@/components/common/Reveal";
import { withResolvedCoverUrls } from "@/lib/media/resolveCoverUrl";
import { getCreatorPrivateStats } from "@/lib/dashboard/creatorStats";
import { PageTitle } from "@/components/ui/heading";
import { NOTICE, PANEL } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";

export default async function CreatorDashboardPage() {
  const { creator } = await requireCreator();
  const [rawJourneys, creatorStats] = await Promise.all([
    prisma.journey.findMany({
      where: { creatorId: creator.id, deletedAt: null },
      orderBy: { order: "asc" },
    }),
    getCreatorPrivateStats(creator.id),
  ]);
  const journeys = await withResolvedCoverUrls(rawJourneys);
  // Un creator può avere più Journey attivi (non archiviati) in parallelo — vedi
  // 00-project-context.md, sezione "Archiviazione del Journey".
  const activeJourneys = journeys.filter((journey) => journey.status !== "ARCHIVED");
  const archivedJourneys = journeys.filter((journey) => journey.status === "ARCHIVED");

  const [chapterCounts, looseEpisodeCounts, episodeCounts, draftCounts] = await Promise.all([
    Promise.all(
      activeJourneys.map((journey) =>
        prisma.chapter.count({ where: { journeyId: journey.id, deletedAt: null } })
      )
    ),
    // Gli episodi senza Capitolo vivono nel gruppo "No Chapter" del pannello di gestione (vedi
    // ChaptersAndEpisodesPanel.tsx): visivamente è indistinguibile da un capitolo vero (ha una sua
    // intestazione e i suoi episodi), quindi qui conta come "un capitolo in più" quando non è vuoto
    // — altrimenti il numero mostrato sembrerebbe sbagliato per errore agli occhi del creator.
    Promise.all(
      activeJourneys.map((journey) =>
        prisma.episode.count({ where: { journeyId: journey.id, deletedAt: null, chapterId: null } })
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
    chapterCount: (chapterCounts[index] ?? 0) + ((looseEpisodeCounts[index] ?? 0) > 0 ? 1 : 0),
    episodeCount: episodeCounts[index] ?? 0,
    draftCount: draftCounts[index] ?? 0,
  }));

  return (
    <main>

      <div className={cn(PAGE_WIDTH.wide, PAGE_SPACING, "space-y-4")}>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-ember">Creator Area</p>
              <PageTitle>
                Hi, {creator.displayName}
              </PageTitle>
            </div>
          </div>
        </Reveal>

        <Reveal delayMs={40}>
          <PrivateStatsPanel stats={creatorStats} title="All Journeys" />
        </Reveal>

        <Reveal delayMs={60}>
          <DashboardPanel title="Your Journeys">
            {gridJourneys.length === 0 ? (
              <p className={NOTICE}>
                You don&apos;t have an active Journey yet. Start one to begin sharing your story.
              </p>
            ) : (
              <JourneyGrid journeys={gridJourneys} />
            )}
          </DashboardPanel>
        </Reveal>

        {archivedJourneys.length > 0 && (
          <Reveal delayMs={90}>
            <DashboardPanel title="Archived Journeys">
              <p className="mb-3 text-sm text-ink-muted">
                Archived Journeys stay visible on your public profile until deleted.
              </p>
              <div className="space-y-3">
                {archivedJourneys.map((journey) => (
                  <Link
                    key={journey.id}
                    href={`/dashboard/journeys/${journey.id}`}
                    className={cn(PANEL, "flex items-center justify-between shadow-card transition-[border-color,box-shadow] duration-300 hover:border-ember-line hover:shadow-glow")}
                  >
                    <span className="text-sm font-semibold text-ink">{journey.title}</span>
                    <span className="rounded-full border border-border px-3 py-1 text-sm font-semibold uppercase tracking-wider text-ink-muted">
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
