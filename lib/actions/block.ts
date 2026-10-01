"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getImagePlaybackUrl } from "@/lib/r2";

/** Blocca/sblocca (stesso pulsante, come toggleFollow): bloccare annulla subito ogni "segui"
 * reciproco tra i due, così nessuno dei due resta a seguire qualcuno che ha appena bloccato. */
export async function toggleBlock(
  targetUserId: string
): Promise<{ error: string | null; isBlocked?: boolean }> {
  const session = await getCurrentSession();
  if (!session) return { error: "You need to sign in to block someone." };
  if (targetUserId === session.user.id) return { error: "You can't block yourself." };

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) return { error: "User not found." };

  const existing = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId: session.user.id, blockedId: targetUserId } },
  });

  if (existing) {
    await prisma.block.delete({ where: { id: existing.id } });
  } else {
    await prisma.$transaction([
      prisma.block.create({ data: { blockerId: session.user.id, blockedId: targetUserId } }),
      prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: session.user.id, followingId: targetUserId },
            { followerId: targetUserId, followingId: session.user.id },
          ],
        },
      }),
    ]);
  }

  revalidatePath(`/profile/${targetUserId}`);
  if (targetUser.username) revalidatePath(`/profile/${targetUser.username}`);
  revalidatePath("/settings/privacy");

  return { error: null, isBlocked: !existing };
}

export type BlockedUserItem = { id: string; name: string; username: string | null; avatarUrl: string | null };

/** Settings > Privacy: elenco di chi ho bloccato io, non chi ha bloccato me (coerente con
 * Instagram/X: il blocco si gestisce solo dal lato di chi l'ha fatto). */
export async function listBlockedUsers(): Promise<BlockedUserItem[]> {
  const session = await getCurrentSession();
  if (!session) return [];

  const blocks = await prisma.block.findMany({
    where: { blockerId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { blocked: { select: { id: true, name: true, username: true, avatarUrl: true } } },
  });

  return Promise.all(
    blocks.map(async ({ blocked }) => ({
      id: blocked.id,
      name: blocked.name,
      username: blocked.username,
      avatarUrl: blocked.avatarUrl ? await getImagePlaybackUrl(blocked.avatarUrl) : null,
    }))
  );
}
