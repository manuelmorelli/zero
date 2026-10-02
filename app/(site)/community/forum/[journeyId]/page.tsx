import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getViewerSession } from "@/lib/session";
import { canWriteInForum } from "@/lib/community/forumAccess";
import { getForumMessages } from "@/lib/community/forumMessages";
import { resolveAvatarUrl } from "@/lib/media/resolveCoverUrl";
import { isPubliclyReachableJourneyStatus } from "@/lib/constants/journeyStatus";
import { ForumMessageList } from "@/components/community/ForumMessageList";
import { ForumComposer } from "@/components/community/ForumComposer";
import { SearchForm } from "@/components/search/SearchForm";
import { PageTitle } from "@/components/ui/heading";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";

export default async function JourneyForumPage({
  params,
  searchParams,
}: {
  params: Promise<{ journeyId: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { journeyId } = await params;
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: { creator: { include: { user: true } } },
  });
  if (!journey || journey.deletedAt || !isPubliclyReachableJourneyStatus(journey.status)) notFound();

  const session = await getViewerSession();
  const viewerUser = session
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, avatarUrl: true } })
    : null;

  const [messages, canWrite] = await Promise.all([
    getForumMessages(journeyId, query),
    session ? canWriteInForum(journeyId, session.user.id) : Promise.resolve(false),
  ]);

  const handle = journey.creator.user.username ?? journey.creator.userId;

  return (
    <main>
      <div className={`${PAGE_WIDTH.narrow} ${PAGE_SPACING}`}>
        <Link href={`/profile/${handle}/community`} className="text-sm font-semibold text-ink-muted transition-colors hover:text-ink">
          {journey.creator.displayName}&apos;s Community
        </Link>

        <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-ember">Forum</p>
        <PageTitle>
          <Link href={`/journeys/${journey.id}`} className="hover:underline">
            {journey.title}
          </Link>
        </PageTitle>
        <p className="mt-1 text-sm text-ink-muted">
          Text-only conversation between people doing this Journey and {journey.creator.displayName}.
        </p>

        <div className="mt-5">
          <SearchForm
            action={`/community/forum/${journeyId}`}
            defaultValue={query}
            placeholder="Search this forum"
          />
        </div>

        <ForumMessageList
          messages={messages}
          currentUserId={session?.user.id ?? null}
          isCreatorViewer={session?.user.id === journey.creator.userId}
          searchQuery={query}
        />

        <ForumComposer
          journeyId={journeyId}
          canWrite={canWrite}
          isLoggedIn={Boolean(session)}
          viewerName={viewerUser?.name ?? ""}
          viewerAvatarUrl={await resolveAvatarUrl(viewerUser?.avatarUrl ?? null)}
        />
      </div>
    </main>
  );
}
