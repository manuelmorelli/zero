import { prisma } from "@/lib/prisma";
import { getImagePlaybackUrl } from "@/lib/r2";

export type FollowListPerson = {
  id: string;
  username: string | null;
  name: string;
  avatarUrl: string | null;
  isFollowedByViewer: boolean;
};

type BasicUser = { id: string; username: string | null; name: string; avatarUrl: string | null };

/** Chi segue ancora chi al momento del voto di ciascun elenco (Followers/Following, aperti da
 * ProfileHero): serve per mostrare il pulsante Segui/Segui già corretto per il visitatore, non
 * per la persona il cui profilo si sta guardando. */
async function toFollowListPeople(users: BasicUser[], viewerId: string | null): Promise<FollowListPerson[]> {
  const followedIds =
    viewerId && users.length > 0
      ? new Set(
          (
            await prisma.follow.findMany({
              where: { followerId: viewerId, followingId: { in: users.map((user) => user.id) } },
              select: { followingId: true },
            })
          ).map((follow) => follow.followingId)
        )
      : new Set<string>();

  return Promise.all(
    users.map(async (user) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl ? await getImagePlaybackUrl(user.avatarUrl) : null,
      isFollowedByViewer: followedIds.has(user.id),
    }))
  );
}

const LIST_LIMIT = 200;

export async function getFollowersList({
  userId,
  viewerId,
}: {
  userId: string;
  viewerId: string | null;
}): Promise<FollowListPerson[]> {
  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    orderBy: { createdAt: "desc" },
    take: LIST_LIMIT,
    select: { follower: { select: { id: true, username: true, name: true, avatarUrl: true } } },
  });
  return toFollowListPeople(
    follows.map((follow) => follow.follower),
    viewerId
  );
}

export async function getFollowingList({
  userId,
  viewerId,
}: {
  userId: string;
  viewerId: string | null;
}): Promise<FollowListPerson[]> {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    orderBy: { createdAt: "desc" },
    take: LIST_LIMIT,
    select: { following: { select: { id: true, username: true, name: true, avatarUrl: true } } },
  });
  return toFollowListPeople(
    follows.map((follow) => follow.following),
    viewerId
  );
}
