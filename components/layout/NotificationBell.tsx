import { getCurrentSession } from "@/lib/session";
import { getUnreadNotificationCount, listNotifications } from "@/lib/notifications";
import { NotificationBellButton } from "@/components/layout/NotificationBellButton";

/**
 * Campanella delle notifiche, globale (montata una sola volta in app/layout.tsx, visibile su
 * tutto il sito per chi è loggato): stesso motivo e stesso pattern del pulsante "+" globale
 * (components/creator/QuickUpload.tsx) — il sito non ha un header comune a tutte le pagine, quindi
 * un elemento fisso montato nel layout root è l'unico modo per renderla visibile ovunque.
 */
export async function NotificationBell() {
  const session = await getCurrentSession();
  if (!session) return null;

  const [unreadCount, notifications] = await Promise.all([
    getUnreadNotificationCount(session.user.id),
    listNotifications(session.user.id),
  ]);

  return (
    <NotificationBellButton
      unreadCount={unreadCount}
      notifications={notifications.map((notification) => ({
        id: notification.id,
        content: notification.content,
        link: notification.link,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      }))}
    />
  );
}
