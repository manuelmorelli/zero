"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { FORUM_MESSAGE_MAX_LENGTH } from "@/lib/constants/forum";
import { canWriteInForum } from "@/lib/community/forumAccess";
import { extractMentionUsernames } from "@/lib/community/mentions";
import { notifyForumMentions } from "@/lib/notifications";
import { searchPeople } from "@/lib/search/searchPeople";

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

  const usernames = extractMentionUsernames(parsed.data.content);
  if (usernames.length > 0) {
    const journey = await prisma.journey.findUnique({
      where: { id: parsed.data.journeyId },
      select: { title: true },
    });
    await notifyForumMentions({
      usernames,
      authorUserId: session.user.id,
      authorName: session.user.name,
      journeyId: parsed.data.journeyId,
      journeyTitle: journey?.title ?? "a Journey",
    });
  }

  return { error: null };
}

export type MentionSuggestion = { username: string; name: string; avatarUrl: string | null };

const MENTION_SUGGESTIONS_LIMIT = 6;

/** Suggerimenti mentre si scrive "@...": chiunque sia iscritto a Zero e abbia uno username
 * (senza, non c'è niente da scrivere dopo la @), tranne sé stessi e le persone bloccate in una
 * delle due direzioni. Query vuota (solo "@") = nessun suggerimento, come su Instagram. */
export async function searchMentionSuggestions(query: string): Promise<MentionSuggestion[]> {
  const session = await requireSession();
  const trimmed = query.trim();
  if (!trimmed) return [];

  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: session.user.id }, { blockedId: session.user.id }] },
    select: { blockerId: true, blockedId: true },
  });
  const excludeIds = [
    session.user.id,
    ...blocks.map((block) => (block.blockerId === session.user.id ? block.blockedId : block.blockerId)),
  ];

  const people = await searchPeople(trimmed, excludeIds, MENTION_SUGGESTIONS_LIMIT * 2);
  return people
    .filter((person): person is typeof person & { username: string } => person.username !== null)
    .slice(0, MENTION_SUGGESTIONS_LIMIT)
    .map((person) => ({ username: person.username, name: person.name, avatarUrl: person.avatarUrl }));
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
