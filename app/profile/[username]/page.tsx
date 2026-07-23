import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// L'username non è ancora impostabile da UI: come fallback temporaneo si accetta
// anche l'id dell'utente nello stesso segmento di rotta, finché non esiste una
// gestione reale degli username. Nessuna nuova regola di business introdotta.
async function findUserByUsernameOrId(usernameOrId: string) {
  const byUsername = await prisma.user.findUnique({ where: { username: usernameOrId } });
  if (byUsername) return byUsername;
  return prisma.user.findUnique({ where: { id: usernameOrId } });
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await findUserByUsernameOrId(username);
  if (!user) notFound();

  const creator = await prisma.creator.findUnique({ where: { userId: user.id } });
  const journeys = creator
    ? await prisma.journey.findMany({
        where: { creatorId: creator.id, status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="font-sans text-xl font-extrabold tracking-tight">
        ZERO
      </Link>

      <h1 className="mt-8 text-2xl font-extrabold tracking-tight">{user.name}</h1>
      {user.bio && <p className="mt-2 text-sm text-ink-muted">{user.bio}</p>}

      <div className="mt-10 space-y-3">
        {journeys.length === 0 && (
          <p className="rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
            {`${user.name} hasn't published any Journey yet.`}
          </p>
        )}
        {journeys.map((journey) => (
          <Link
            key={journey.id}
            href={`/journeys/${journey.id}`}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 transition-colors hover:border-ink-muted"
          >
            <span className="text-sm font-semibold text-ink">{journey.title}</span>
            {journey.category && (
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-ink-muted">
                {journey.category}
              </span>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
