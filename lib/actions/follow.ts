"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getFollowersList, getFollowingList, type FollowListPerson } from "@/lib/profile/followList";

export async function toggleFollow(
  targetUserId: string
): Promise<{ error: string | null; isFollowing?: boolean }> {
  const session = await getCurrentSession();
  if (!session) return { error: "You need to sign in to follow someone." };
  if (targetUserId === session.user.id) {
    return { error: "You can't follow yourself." };
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) return { error: "User not found." };

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({ data: { followerId: session.user.id, followingId: targetUserId } });
  }

  // Il profilo del bersaglio mostra il pulsante Message in base al Follow appena cambiato
  // (vedi lib/messaging.ts, canMessage): senza revalidation resterebbe con lo stato letto al
  // primo caricamento della pagina finché non viene ricaricata manualmente.
  revalidatePath(`/profile/${targetUserId}`);
  if (targetUser.username) revalidatePath(`/profile/${targetUser.username}`);

  return { error: null, isFollowing: !existing };
}

/** Caricata solo quando si apre l'elenco (components/profile/ProfileFollowStats.tsx), non insieme
 * al resto della pagina Profilo: la maggior parte delle visite non apre mai Followers/Following. */
export async function loadFollowList(
  kind: "followers" | "following",
  userId: string
): Promise<FollowListPerson[]> {
  const session = await getCurrentSession();
  const viewerId = session?.user.id ?? null;
  return kind === "followers"
    ? getFollowersList({ userId, viewerId })
    : getFollowingList({ userId, viewerId });
}
