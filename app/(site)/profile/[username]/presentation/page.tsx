import { notFound } from "next/navigation";
import { Calendar, MapPin, PenLine } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getViewerSession } from "@/lib/session";
import { getImagePlaybackUrl, getVideoPlaybackUrl } from "@/lib/r2";
import { findUserByUsernameOrId } from "@/lib/profile/findUserByUsernameOrId";
import { isBlockedEitherWay } from "@/lib/block";
import { PresentationVideoView } from "@/components/profile/PresentationVideoView";
import { PageTitle, CardTitle } from "@/components/ui/heading";
import { PAGE_WIDTH, PAGE_SPACING } from "@/components/ui/page-container";
import { CHIP } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

/** Pagina "Bio & presentation": bio completa + video di presentazione a schermo intero,
 * raggiunta dal link "altro" sotto il nome nella Hero del profilo (solo mobile, bio troncata a
 * una riga lì). Stessa logica di accesso di app/(site)/profile/[username]/page.tsx (blocco,
 * account privato): il video resta nascosto se il profilo è gated, la bio no (chi non segue
 * ancora un account privato vede comunque nome/foto/bio, mai i Journey/Update). */
export default async function PresentationPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await findUserByUsernameOrId(username);
  if (!user || user.deletedAt) notFound();

  const session = await getViewerSession();
  const isOwnProfile = session?.user.id === user.id;

  if (session && !isOwnProfile && (await isBlockedEitherWay(session.user.id, user.id))) {
    return (
      <main className={cn(PAGE_WIDTH.narrow, PAGE_SPACING)}>
        <PageTitle>Profile unavailable</PageTitle>
        <p className="mt-2 text-sm text-ink-muted">This profile isn&apos;t available.</p>
      </main>
    );
  }

  const isFollowing =
    session && !isOwnProfile
      ? Boolean(
          await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } },
          })
        )
      : false;
  const isPrivateGateActive = !isOwnProfile && user.isPrivate && !isFollowing;

  const creator = isPrivateGateActive ? null : await prisma.creator.findUnique({ where: { userId: user.id } });
  const presentationVideoUrl = creator?.presentationVideoUrl
    ? await getVideoPlaybackUrl(creator.presentationVideoUrl)
    : null;
  const presentationCoverUrl = creator?.presentationCoverUrl
    ? await getImagePlaybackUrl(creator.presentationCoverUrl)
    : null;
  const showPresentationVideo = isOwnProfile || presentationVideoUrl !== null;
  const joinedLabel = user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <main className={cn(PAGE_WIDTH.narrow, PAGE_SPACING)}>
      <PageTitle>Bio & presentation</PageTitle>

      {showPresentationVideo && (
        <div className="mt-5">
          <PresentationVideoView
            videoUrl={presentationVideoUrl}
            coverUrl={presentationCoverUrl}
            isOwnProfile={isOwnProfile}
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
        {user.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {user.location}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          Joined {joinedLabel}
        </span>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <CardTitle as="h2" className="inline-flex items-center gap-1.5 text-ember">
          <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
          Bio
        </CardTitle>
        {user.bio ? (
          <p className="mt-3 whitespace-pre-wrap break-words text-base leading-relaxed text-ink">{user.bio}</p>
        ) : (
          <p className="mt-3 text-sm text-ink-faint">{user.name} hasn&apos;t written a bio yet.</p>
        )}
        {user.interests.length > 0 && (
          <div className="mt-4">
            <p className="text-sm uppercase tracking-wider text-ink-faint">Focus</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <span key={interest} className={CHIP}>
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
