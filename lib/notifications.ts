import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/generated/prisma/client";

/**
 * Le notifiche non hanno una scadenza naturale (a differenza degli Update, che scadono a 24h):
 * invece di un cron job, ogni volta che se ne crea una nuova per un utente si eliminano le più
 * vecchie oltre questo limite, stesso principio "pulizia al volo" già in uso per gli Update
 * (vedi deleteExpiredUpdates in lib/updates.ts), solo applicato alla scrittura invece che alla lettura.
 */
const MAX_NOTIFICATIONS_PER_USER = 50;

async function pruneOldNotifications(userId: string): Promise<void> {
  const stale = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: MAX_NOTIFICATIONS_PER_USER,
    select: { id: true },
  });
  if (stale.length === 0) return;

  await prisma.notification.deleteMany({
    where: { id: { in: stale.map((notification) => notification.id) } },
  });
}

async function notifyFollowers(params: {
  creatorId: string;
  type: NotificationType;
  content: string;
  link: string;
}): Promise<void> {
  const followers = await prisma.follow.findMany({
    where: { creatorId: params.creatorId },
    select: { userId: true },
  });
  if (followers.length === 0) return;

  await prisma.notification.createMany({
    data: followers.map((follower) => ({
      userId: follower.userId,
      type: params.type,
      content: params.content,
      link: params.link,
    })),
  });

  await Promise.all(followers.map((follower) => pruneOldNotifications(follower.userId)));
}

/**
 * Un episodio genera una notifica "nuovo episodio" solo se aggiunto DOPO che il Journey era
 * già pubblicato — stessa regola già usata dal Feed dei creator seguiti in Home (vedi
 * lib/discovery/feed.ts): gli episodi caricati mentre il Journey è ancora in Bozza diventano
 * visibili tutti insieme al momento della pubblicazione, già coperto da `notifyNewJourney`.
 */
export async function notifyNewEpisode(params: {
  creatorId: string;
  creatorName: string;
  journeyId: string;
  journeyTitle: string;
  episodeId: string;
  episodeTitle: string;
}): Promise<void> {
  await notifyFollowers({
    creatorId: params.creatorId,
    type: "NEW_EPISODE",
    content: `${params.creatorName} published a new episode in ${params.journeyTitle}: ${params.episodeTitle}`,
    link: `/journeys/${params.journeyId}#${params.episodeId}`,
  });
}

/** Solo alla prima pubblicazione di un Journey (mai alle ripubblicazioni successive). */
export async function notifyNewJourney(params: {
  creatorId: string;
  creatorName: string;
  journeyId: string;
  journeyTitle: string;
}): Promise<void> {
  await notifyFollowers({
    creatorId: params.creatorId,
    type: "NEW_JOURNEY",
    content: `${params.creatorName} published a new Journey: ${params.journeyTitle}`,
    link: `/journeys/${params.journeyId}`,
  });
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function listNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
