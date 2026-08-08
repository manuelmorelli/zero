"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import type { LikeTargetType } from "@/generated/prisma/client";

export async function toggleLike(
  targetType: LikeTargetType,
  targetId: string
): Promise<{ error: string | null; isLiked?: boolean }> {
  const session = await getCurrentSession();
  if (!session) return { error: "You need to sign in to like this." };

  const existing = await prisma.like.findUnique({
    where: { userId_targetType_targetId: { userId: session.user.id, targetType, targetId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId: session.user.id, targetType, targetId } });
  }

  return { error: null, isLiked: !existing };
}
