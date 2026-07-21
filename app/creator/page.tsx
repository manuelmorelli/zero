import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  DISCOVERY: "In scoperta",
  PUBLISHED: "Pubblicato",
  ARCHIVED: "Archiviato",
};

export default async function CreatorDashboardPage() {
  const { creator } = await requireCreator();
  const journeys = await prisma.journey.findMany({
    where: { creatorId: creator.id },
    orderBy: { createdAt: "desc" },
  });
  const hasActiveJourney = journeys.some((journey) => journey.status !== "ARCHIVED");

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="font-sans text-xl font-extrabold tracking-tight">
        ZERO
      </Link>

      <div className="mt-8 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Ciao, {creator.displayName}
        </h1>
        {!hasActiveJourney && (
          <Link
            href="/creator/journeys/new"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
          >
            Nuovo Journey
          </Link>
        )}
      </div>

      <p className="mt-2 text-sm text-ink-muted">
        Da qui gestisci i tuoi Journey.
      </p>

      <div className="mt-8 space-y-3">
        {journeys.length === 0 && (
          <p className="rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
            Non hai ancora creato nessun Journey.
          </p>
        )}
        {journeys.map((journey) => (
          <Link
            key={journey.id}
            href={`/creator/journeys/${journey.id}`}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 transition-colors hover:border-ink-muted"
          >
            <span className="text-sm font-semibold text-ink">{journey.title}</span>
            <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-ink-muted">
              {STATUS_LABEL[journey.status] ?? journey.status}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
