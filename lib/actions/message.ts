"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import {
  canMessage,
  getConversationChatData,
  getConversationForParticipant,
  listMessagesAfter,
  orderedPair,
  otherParticipant,
} from "@/lib/messaging";
import { getImagePlaybackUrl } from "@/lib/r2";
import { MESSAGE_MAX_LENGTH } from "@/lib/constants/messages";

/** Trova la conversazione con `targetUserId` o la crea, se almeno una delle due persone segue l'altra. */
export async function startConversation(
  targetUserId: string
): Promise<{ error: string | null; conversationId?: string }> {
  const { user } = await requireSession();
  if (targetUserId === user.id) return { error: "You can't message yourself." };

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) return { error: "User not found." };

  const allowed = await canMessage(user.id, targetUserId);
  if (!allowed) {
    return { error: "You can only message people you follow, or who follow you." };
  }

  const [userAId, userBId] = orderedPair(user.id, targetUserId);
  const conversation = await prisma.conversation.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    update: {},
    create: { userAId, userBId },
  });

  return { error: null, conversationId: conversation.id };
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ error: string | null; message?: { id: string; senderId: string; content: string; createdAt: string } }> {
  const { user } = await requireSession();

  const trimmed = content.trim();
  if (!trimmed) return { error: "Message can't be empty." };
  if (trimmed.length > MESSAGE_MAX_LENGTH) return { error: "Message is too long." };

  const conversation = await getConversationForParticipant(conversationId, user.id);
  if (!conversation) return { error: "Conversation not found." };

  const { userId: otherUserId } = otherParticipant(conversation, user.id);
  const allowed = await canMessage(user.id, otherUserId);
  if (!allowed) {
    return { error: "You can only message people you follow, or who follow you." };
  }

  const [created] = await prisma.$transaction([
    prisma.message.create({ data: { conversationId, senderId: user.id, content: trimmed } }),
    prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } }),
  ]);

  return {
    error: null,
    message: {
      id: created.id,
      senderId: created.senderId,
      content: created.content,
      createdAt: created.createdAt.toISOString(),
    },
  };
}

/**
 * Dati di una conversazione già esistente, per aprirla nella finestra di risposta rapida
 * dell'iconcina flottante (components/messages/InlineChat.tsx) senza cambiare pagina — stessi
 * dati che la pagina intera (app/(site)/messages/[conversationId]/page.tsx) ottiene lato server.
 */
export async function getConversationForChat(conversationId: string): Promise<{
  error: string | null;
  data?: {
    otherUser: { name: string; avatarUrl: string | null };
    messages: { id: string; senderId: string; content: string; createdAt: string }[];
    canWrite: boolean;
  };
}> {
  const { user } = await requireSession();
  const chatData = await getConversationChatData(conversationId, user.id);
  if (!chatData) return { error: "Conversation not found." };

  const otherUserAvatarUrl = chatData.otherUser.avatarUrl
    ? await getImagePlaybackUrl(chatData.otherUser.avatarUrl)
    : null;

  return {
    error: null,
    data: {
      otherUser: { name: chatData.otherUser.name, avatarUrl: otherUserAvatarUrl },
      messages: chatData.messages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      })),
      canWrite: chatData.canWrite,
    },
  };
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const { user } = await requireSession();
  const conversation = await getConversationForParticipant(conversationId, user.id);
  if (!conversation) return;

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: user.id }, read: false },
    data: { read: true },
  });

  // Il pallino "non letti" dell'iconcina messaggi (components/messages/MessagesWidget.tsx) vive
  // nel layout radice, condiviso da tutto il sito: senza questa invalidazione resta fermo al
  // valore letto al primo caricamento della sessione finché non si ricarica l'intera pagina,
  // anche se il messaggio è stato appena segnato come letto qui sopra.
  revalidatePath("/", "layout");
}

/**
 * Chiamata dalla chat aperta ogni 15-20 secondi (nessun websocket, vedi 19_Messaging.md):
 * restituisce i messaggi arrivati dopo `afterIso` e segna subito come letti quelli ricevuti,
 * dato che la conversazione è visibile sullo schermo. `canWrite` riflette lo stato attuale del
 * Follow, che può essere cambiato da quando la pagina è stata caricata.
 */
export async function pollMessages(
  conversationId: string,
  afterIso: string
): Promise<{ error: string | null; messages?: { id: string; senderId: string; content: string; createdAt: string }[]; canWrite?: boolean }> {
  const { user } = await requireSession();
  const conversation = await getConversationForParticipant(conversationId, user.id);
  if (!conversation) return { error: "Conversation not found." };

  const { userId: otherUserId } = otherParticipant(conversation, user.id);
  const [messages, canWrite] = await Promise.all([
    listMessagesAfter(conversationId, new Date(afterIso)),
    canMessage(user.id, otherUserId),
  ]);

  const unreadFromOther = messages.filter((message) => message.senderId !== user.id);
  if (unreadFromOther.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: unreadFromOther.map((message) => message.id) }, read: false },
      data: { read: true },
    });
  }

  return {
    error: null,
    canWrite,
    messages: messages.map((message) => ({
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    })),
  };
}
