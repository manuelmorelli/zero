"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { FORUM_MESSAGE_MAX_LENGTH } from "@/lib/constants/forum";
import { canWriteInForum } from "@/lib/community/forumAccess";

const PostSchema = z.object({
  journeyId: z.string().trim().min(1),
  content: z.string().trim().min(1).max(FORUM_MESSAGE_MAX_LENGTH),
});

export async function postForumMessage(journeyId: string, content: string): Promise<{ error: string | null }> {
  const session = await requireSession();

  const parsed = PostSchema.safeParse({ journeyId, content });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid message." };
  }

  const allowed = await canWriteInForum(parsed.data.journeyId, session.user.id);
  if (!allowed) {
    return { error: "You can post here once you've started this Journey." };
  }

  await prisma.forumMessage.create({
    data: {
      journeyId: parsed.data.journeyId,
      authorId: session.user.id,
      content: parsed.data.content,
    },
  });

  return { error: null };
}

/** Cancellazione propria (autore) o moderazione del creator sul forum del proprio Journey —
 * nessun'altra forma di moderazione in questa V1 (vedi ReportButton per le segnalazioni). */
export async function deleteForumMessage(messageId: string): Promise<{ error: string | null }> {
  const session = await requireSession();

  const message = await prisma.forumMessage.findUnique({
    where: { id: messageId },
    select: { authorId: true, journey: { select: { creator: { select: { userId: true } } } } },
  });
  if (!message) return { error: "Message not found." };

  const isAuthor = message.authorId === session.user.id;
  const isCreator = message.journey.creator.userId === session.user.id;
  if (!isAuthor && !isCreator) {
    return { error: "You can't delete this message." };
  }

  await prisma.forumMessage.update({ where: { id: messageId }, data: { deletedAt: new Date() } });
  return { error: null };
}
