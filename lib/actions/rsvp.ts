"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

type RsvpResult = { going: boolean } | { error: string };

/** "Partecipo" a un Workshop/Evento gratuito (Punto 8 dell'allineamento, 2026-09-25): non è un
 * acquisto, solo un'iscrizione reale — nessun coinvolgimento di Stripe, funziona già oggi. Un
 * secondo click annulla l'iscrizione. */
export async function toggleWorkshopRsvp(workshopId: string): Promise<RsvpResult> {
  const { user } = await requireSession();

  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    include: { creator: { include: { user: true } } },
  });
  if (!workshop || workshop.deletedAt || workshop.status !== "ACTIVE" || !workshop.isFree) {
    return { error: "This workshop isn't open for RSVPs." };
  }

  const existing = await prisma.workshopRsvp.findUnique({
    where: { workshopId_userId: { workshopId, userId: user.id } },
  });

  if (existing) {
    await prisma.workshopRsvp.delete({ where: { id: existing.id } });
  } else {
    await prisma.workshopRsvp.create({ data: { workshopId, userId: user.id } });
  }

  const handle = workshop.creator.user.username ?? workshop.creator.userId;
  revalidatePath(`/profile/${handle}`);
  revalidatePath("/dashboard/community");
  return { going: !existing };
}

export async function toggleEventRsvp(eventId: string): Promise<RsvpResult> {
  const { user } = await requireSession();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { creator: { include: { user: true } } },
  });
  if (!event || event.deletedAt || event.status !== "ACTIVE" || !event.isFree) {
    return { error: "This event isn't open for RSVPs." };
  }

  const existing = await prisma.eventRsvp.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });

  if (existing) {
    await prisma.eventRsvp.delete({ where: { id: existing.id } });
  } else {
    await prisma.eventRsvp.create({ data: { eventId, userId: user.id } });
  }

  const handle = event.creator.user.username ?? event.creator.userId;
  revalidatePath(`/profile/${handle}`);
  revalidatePath("/dashboard/community");
  return { going: !existing };
}
