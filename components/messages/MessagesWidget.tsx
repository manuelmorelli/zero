import { getCurrentSession } from "@/lib/session";
import { listConversations } from "@/lib/messaging";
import { getImagePlaybackUrl } from "@/lib/r2";
import { MessagesButtonClient } from "@/components/messages/MessagesButtonClient";

/**
 * Pulsante flottante dei Messaggi, globale (montato una sola volta in app/layout.tsx, come
 * QuickUpload e NotificationBell): stesso motivo, il sito non ha un header comune a tutte le
 * pagine. Pallino "non letti" separato da quello della campanella (19_Messaging.md): i due
 * canali non si mescolano mai, un nuovo messaggio non genera una notifica generale.
 */
export async function MessagesWidget() {
  const session = await getCurrentSession();
  if (!session) return null;

  const conversations = await listConversations(session.user.id);
  const unreadCount = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

  const items = await Promise.all(
    conversations.slice(0, 20).map(async (conversation) => ({
      id: conversation.id,
      otherUserName: conversation.otherUser.name,
      otherUserAvatarUrl: conversation.otherUser.avatarUrl
        ? await getImagePlaybackUrl(conversation.otherUser.avatarUrl)
        : null,
      lastMessagePreview: conversation.lastMessage?.content ?? null,
      lastMessageAt: conversation.lastMessageAt.toISOString(),
      unreadCount: conversation.unreadCount,
    }))
  );

  return <MessagesButtonClient unreadCount={unreadCount} conversations={items} />;
}
