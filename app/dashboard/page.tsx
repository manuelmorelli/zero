import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { deleteExpiredUpdates } from "@/lib/updates";
import { UpdateForm } from "@/components/creator/UpdateForm";
import { UpdateItem } from "@/components/creator/UpdateItem";

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
  const hasActiveJourney = journeys.some((journey) => journey.status !== "ARCHIVED");

  await deleteExpiredUpdates();
  const updates = await prisma.update.findMany({
    where: { creatorId: creator.id, archivedAt: { gt: new Date() } },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="font-sans text-xl font-extrabold tracking-tight">
        ZERO
      </Link>

      <div className="mt-8 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Hi, {creator.displayName}
        </h1>
        {!hasActiveJourney && (
          <Link
            href="/dashboard/journeys/new"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
          >
            New Journey
          </Link>
        )}
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

      <div className="mt-8 space-y-3">
        {journeys.length === 0 && (
          <p className="rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
            You haven&apos;t created any Journeys yet.
          </p>
        )}
        {journeys.map((journey) => (
          <Link
            key={journey.id}
            href={`/dashboard/journeys/${journey.id}`}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 transition-colors hover:border-ink-muted"
          >
            <span className="text-sm font-semibold text-ink">{journey.title}</span>
            <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-ink-muted">
              {STATUS_LABEL[journey.status] ?? journey.status}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-bold text-ink">Updates</h2>
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
            updates.map((update) => <UpdateItem key={update.id} update={update} />)
          )}
        </div>
      </div>
    </main>
  );
}
