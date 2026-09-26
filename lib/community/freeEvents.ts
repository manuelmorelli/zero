import { prisma } from "@/lib/prisma";
import { getImagePlaybackUrl } from "@/lib/r2";
import type { FreeEventItem } from "@/components/profile/FreeEventsSection";

/**
 * Workshop/Eventi gratuiti e pubblicati di un creator, con quante persone hanno detto "Partecipo"
 * e se il visitatore stesso lo ha già fatto. Condivisa tra il profilo pubblico (dove compare come
 * anteprima, richiesto da Manuel il 2026-09-26: "la card in home page personale non mi dispiace")
 * e la pagina Community (dove è l'elenco completo, insieme alle offerte a pagamento).
 */
export async function getFreeEventItems(creatorId: string, viewerUserId: string | null): Promise<FreeEventItem[]> {
  const [freeWorkshops, freeEventRows] = await Promise.all([
    prisma.workshop.findMany({
      where: { creatorId, deletedAt: null, status: "ACTIVE", isFree: true },
      orderBy: { startsAt: "asc" },
      include: {
        _count: { select: { rsvps: true } },
        rsvps: viewerUserId ? { where: { userId: viewerUserId }, select: { id: true } } : false,
      },
    }),
    prisma.event.findMany({
      where: { creatorId, deletedAt: null, status: "ACTIVE", isFree: true },
      orderBy: { startsAt: "asc" },
      include: {
        _count: { select: { rsvps: true } },
        rsvps: viewerUserId ? { where: { userId: viewerUserId }, select: { id: true } } : false,
      },
    }),
  ]);

  const [workshopItems, eventItems] = await Promise.all([
    Promise.all(
      freeWorkshops.map(async (item) => ({
        kind: "workshop" as const,
        id: item.id,
        title: item.title,
        description: item.description,
        startsAt: item.startsAt ? item.startsAt.toISOString() : null,
        coverUrl: item.coverUrl ? await getImagePlaybackUrl(item.coverUrl) : null,
        going: Array.isArray(item.rsvps) && item.rsvps.length > 0,
        rsvpCount: item._count.rsvps,
      }))
    ),
    Promise.all(
      freeEventRows.map(async (item) => ({
        kind: "event" as const,
        id: item.id,
        title: item.title,
        description: item.description,
        startsAt: item.startsAt ? item.startsAt.toISOString() : null,
        coverUrl: item.coverUrl ? await getImagePlaybackUrl(item.coverUrl) : null,
        going: Array.isArray(item.rsvps) && item.rsvps.length > 0,
        rsvpCount: item._count.rsvps,
      }))
    ),
  ]);

  return [...workshopItems, ...eventItems];
}
