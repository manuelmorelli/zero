"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function toggleFollow(
  creatorId: string
): Promise<{ error: string | null; isFollowing?: boolean }> {
  const session = await getCurrentSession();
  if (!session) return { error: "You need to sign in to follow a creator." };

  const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
  if (!creator) return { error: "Creator not found." };
  if (creator.userId === session.user.id) {
    return { error: "You can't follow yourself." };
  }

  const existing = await prisma.follow.findUnique({
    where: { userId_creatorId: { userId: session.user.id, creatorId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({ data: { userId: session.user.id, creatorId } });
  }

  return { error: null, isFollowing: !existing };
}
