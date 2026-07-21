import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  DISCOVERY: "In scoperta",
  PUBLISHED: "Pubblicato",
  ARCHIVED: "Archiviato",
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

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/creator" className="font-sans text-xl font-extrabold tracking-tight">
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

      <div className="mt-10 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-ink">Capitoli</h2>
        <p className="mt-2 text-sm text-ink-muted">
          La gestione di Capitoli ed Episodi arriva nel prossimo passo.
        </p>
      </div>
    </main>
  );
}
