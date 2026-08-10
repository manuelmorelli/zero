"use server";

import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function markAllNotificationsRead(): Promise<void> {
  const { user } = await requireSession();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const { user } = await requireSession();
  // updateMany invece di update: se la notifica non è dell'utente corrente non succede
  // nulla, invece di sollevare un errore "record not found".
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true },
  });
}
