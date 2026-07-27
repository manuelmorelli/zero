import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { FollowButton } from "@/components/creator/FollowButton";
import { JourneyCard } from "@/components/journey/JourneyCard";

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
  // Published Journeys are shown alongside archived ones: archiving retires a Journey
  // from active management, but it stays visible on the public profile (never deleted).
  const journeys = creator
    ? await prisma.journey.findMany({
        where: {
          creatorId: creator.id,
          status: { in: ["PUBLISHED", "ARCHIVED"] },
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const session = await getCurrentSession();
  const isOwnProfile = session?.user.id === user.id;
  const followersCount = creator
    ? await prisma.follow.count({ where: { creatorId: creator.id } })
    : 0;
  const isFollowing =
    creator && session && !isOwnProfile
      ? Boolean(
          await prisma.follow.findUnique({
            where: { userId_creatorId: { userId: session.user.id, creatorId: creator.id } },
          })
        )
      : false;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="font-sans text-xl font-extrabold tracking-tight">
        ZERO
      </Link>

      <h1 className="mt-8 text-2xl font-extrabold tracking-tight">{user.name}</h1>
      {user.bio && <p className="mt-2 text-sm text-ink-muted">{user.bio}</p>}

      {creator && !isOwnProfile && (
        <div className="mt-4">
          <FollowButton
            creatorId={creator.id}
            initialFollowersCount={followersCount}
            initialIsFollowing={isFollowing}
            isLoggedIn={Boolean(session)}
          />
        </div>
      )}

      <div className="mt-10 space-y-3">
        {journeys.length === 0 && (
          <p className="rounded-xl border border-border bg-surface p-6 text-sm text-ink-muted">
            {`${user.name} hasn't published any Journey yet.`}
          </p>
        )}
        {creator && journeys.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {journeys.map((journey) => (
              <Link key={journey.id} href={`/journeys/${journey.id}`} className="relative block">
                {journey.status === "ARCHIVED" && (
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">
                    Archived
                  </span>
                )}
                <JourneyCard
                  journey={{
                    id: journey.id,
                    title: journey.title,
                    coverUrl: journey.coverUrl,
                    category: journey.category,
                    creator: { displayName: creator.displayName },
                    followersCount,
                  }}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
