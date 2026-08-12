import { prisma } from "@/lib/prisma";

/**
 * Le due persone di una Conversation sono salvate in ordine normalizzato (userAId sempre
 * minore di userBId, ordine lessicografico sugli id) così la coppia ha sempre una sola riga
 * possibile, indipendentemente da chi scrive per primo.
 */
export function orderedPair(userId1: string, userId2: string): [string, string] {
  return userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
}

/**
 * Basta che una delle due persone segua l'altra, non serve il follow reciproco (vedi
 * 00-project-context.md, sezione "Follow universale", revisione 2026-08-12).
 */
export async function canMessage(userId1: string, userId2: string): Promise<boolean> {
  if (userId1 === userId2) return false;
  const follow = await prisma.follow.findFirst({
    where: {
      OR: [
        { followerId: userId1, followingId: userId2 },
        { followerId: userId2, followingId: userId1 },
      ],
    },
    select: { id: true },
  });
  return Boolean(follow);
}

export async function findConversationBetween(userId1: string, userId2: string) {
  const [userAId, userBId] = orderedPair(userId1, userId2);
  return prisma.conversation.findUnique({ where: { userAId_userBId: { userAId, userBId } } });
}

/** Conversazione con controllo di proprietà: null se non esiste o se `userId` non ne fa parte. */
export async function getConversationForParticipant(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { userA: true, userB: true },
  });
  if (!conversation) return null;
  if (conversation.userAId !== userId && conversation.userBId !== userId) return null;
  return conversation;
}

export function otherParticipant<U extends { id: string }>(
  conversation: { userAId: string; userA: U; userBId: string; userB: U },
  userId: string
): { user: U; userId: string } {
  return conversation.userAId === userId
    ? { user: conversation.userB, userId: conversation.userBId }
    : { user: conversation.userA, userId: conversation.userAId };
}

export async function listMessages(conversationId: string) {
  return prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: "asc" } });
}

/** Messaggi arrivati dopo un certo momento, per il polling della chat aperta (19_Messaging.md). */
export async function listMessagesAfter(conversationId: string, after: Date) {
  return prisma.message.findMany({
    where: { conversationId, createdAt: { gt: after } },
    orderBy: { createdAt: "asc" },
  });
}

export async function listConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: { lastMessageAt: "desc" },
    include: {
      userA: true,
      userB: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return Promise.all(
    conversations.map(async (conversation) => {
      const { user: otherUser } = otherParticipant(conversation, userId);
      const unreadCount = await prisma.message.count({
        where: { conversationId: conversation.id, senderId: { not: userId }, read: false },
      });
      return {
        id: conversation.id,
        lastMessageAt: conversation.lastMessageAt,
        otherUser,
        lastMessage: conversation.messages[0] ?? null,
        unreadCount,
      };
    })
  );
}

export async function getUnreadMessagesCount(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      read: false,
      senderId: { not: userId },
      conversation: { OR: [{ userAId: userId }, { userBId: userId }] },
    },
  });
}
