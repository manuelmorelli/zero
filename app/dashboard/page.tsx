import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { deleteExpiredUpdates } from "@/lib/updates";
import { JourneyPublishControl } from "@/components/creator/JourneyPublishControl";
import { JourneyArchiveButton } from "@/components/creator/JourneyArchiveButton";
import { UpdateForm } from "@/components/creator/UpdateForm";
import { UpdateItem } from "@/components/creator/UpdateItem";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/common/Reveal";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  DISCOVERY: "In Discovery",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export default async function CreatorDashboardPage() {
  const { user, creator } = await requireCreator();
  const journeys = await prisma.journey.findMany({
    where: { creatorId: creator.id },
    orderBy: { createdAt: "desc" },
  });
  // Un creator può avere più Journey attivi (non archiviati) in parallelo — vedi
  // 00-project-context.md, sezione "Archiviazione del Journey".
  const activeJourneys = journeys.filter((journey) => journey.status !== "ARCHIVED");
  const archivedJourneys = journeys.filter((journey) => journey.status === "ARCHIVED");

  const [chapterCounts, episodeCounts] = await Promise.all([
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
  ]);

  await deleteExpiredUpdates();
  const updates = await prisma.update.findMany({
    where: { creatorId: creator.id, archivedAt: { gt: new Date() } },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main>
      <PageHeader />

      <div className="mx-auto max-w-2xl px-6 py-14">
        <Reveal>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Hi, {creator.displayName}
            </h1>
            <Link
              href="/dashboard/journeys/new"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
            >
              New Journey
            </Link>
          </div>

          <p className="mt-2 text-sm text-ink-muted">
            Manage your Journeys from here.
          </p>

          <Link
            href={`/profile/${user.id}`}
            className="mt-3 inline-block text-sm font-medium text-ink underline underline-offset-2"
          >
            View public profile
          </Link>
        </Reveal>

        <Reveal delayMs={80}>
          <div className="mt-12 border-t border-border pt-10">
            <h2 className="text-lg font-bold tracking-tight text-ink">Your Journeys</h2>

            {activeJourneys.length === 0 && (
              <p className="mt-4 rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
                You don&apos;t have an active Journey yet. Start one to begin sharing your story.
              </p>
            )}

            <div className="mt-4 space-y-4">
              {activeJourneys.map((journey, index) => (
                <div
                  key={journey.id}
                  className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-ink-muted"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{journey.title}</h3>
                      <p className="mt-2 text-xs font-medium text-ink-muted">
                        {chapterCounts[index]} {chapterCounts[index] === 1 ? "chapter" : "chapters"} ·{" "}
                        {episodeCounts[index]} {episodeCounts[index] === 1 ? "episode" : "episodes"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      {STATUS_LABEL[journey.status] ?? journey.status}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <Link
                      href={`/dashboard/journeys/${journey.id}`}
                      className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
                    >
                      Manage
                    </Link>
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

                  <div className="mt-4 border-t border-border pt-4">
                    <JourneyArchiveButton journeyId={journey.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {archivedJourneys.length > 0 && (
          <Reveal delayMs={80}>
            <div className="mt-12 border-t border-border pt-10">
              <h2 className="text-lg font-bold tracking-tight text-ink">Archived Journeys</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Archived Journeys stay visible on your public profile. They can&apos;t be deleted or
                reactivated.
              </p>

              <div className="mt-4 space-y-3">
                {archivedJourneys.map((journey) => (
                  <Link
                    key={journey.id}
                    href={`/dashboard/journeys/${journey.id}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 transition-colors hover:border-ink-muted"
                  >
                    <span className="text-sm font-semibold text-ink">{journey.title}</span>
                    <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      Archived
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        <Reveal delayMs={80}>
          <div className="mt-12 border-t border-border pt-10">
            <h2 className="text-lg font-bold tracking-tight text-ink">Updates</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Short, temporary posts for your followers. Each one disappears after 24 hours.
            </p>

            <div className="mt-4">
              <UpdateForm />
            </div>

            <div className="mt-6 space-y-3">
              {updates.length === 0 ? (
                <p className="rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
                  You don&apos;t have any active Updates right now.
                </p>
              ) : (
                updates.map((update, index) => (
                  <Reveal key={update.id} delayMs={index * 60}>
                    <UpdateItem update={update} />
                  </Reveal>
                ))
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
