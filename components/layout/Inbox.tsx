import { getCurrentSession } from "@/lib/session";
import { getUnreadNotificationCount, listNotifications } from "@/lib/notifications";
import { listConversations } from "@/lib/messaging";
import { getImagePlaybackUrl } from "@/lib/r2";
import { InboxButton } from "@/components/layout/InboxButton";

/**
 * Campanella unica, globale (montata una sola volta in app/layout.tsx, visibile su tutto il
 * sito per chi è loggato): sostituisce i due pulsanti separati di prima (NotificationBell +
 * MessagesWidget), uniti in un solo pannello su richiesta di Manuel, 2026-10-29.
 */
export async function Inbox() {
  const session = await getCurrentSession();
  if (!session) return null;

  const [unreadNotifications, notifications, conversations] = await Promise.all([
    getUnreadNotificationCount(session.user.id),
    listNotifications(session.user.id),
    listConversations(session.user.id),
  ]);

  const messageItems = await Promise.all(
    conversations.slice(0, 20).map(async (conversation) => ({
      kind: "message" as const,
      id: conversation.id,
      otherUserName: conversation.otherUser.name,
      otherUserAvatarUrl: conversation.otherUser.avatarUrl
        ? await getImagePlaybackUrl(conversation.otherUser.avatarUrl)
        : null,
      lastMessagePreview: conversation.lastMessage?.content ?? null,
      at: conversation.lastMessageAt.toISOString(),
      unreadCount: conversation.unreadCount,
    }))
  );

  const notificationItems = notifications.map((notification) => ({
    kind: "notification" as const,
    id: notification.id,
    content: notification.content,
    link: notification.link,
    read: notification.read,
    at: notification.createdAt.toISOString(),
  }));

  const items = [...notificationItems, ...messageItems].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  const unreadMessages = messageItems.reduce((sum, item) => sum + item.unreadCount, 0);

  return <InboxButton unreadCount={unreadNotifications + unreadMessages} items={items} currentUserId={session.user.id} />;
}
