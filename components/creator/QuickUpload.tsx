import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { QuickUploadButton } from "@/components/creator/QuickUploadButton";

/**
 * Pulsante "+" globale (montato una sola volta in app/layout.tsx, visibile su tutto il sito
 * per chi è loggato): recupera qui, lato server, i Journey attivi (non archiviati) e i loro
 * Capitoli, così il componente client non deve andarli a cercare lui stesso al momento
 * dell'apertura. Un creator può avere più Journey attivi in parallelo (vedi
 * 00-project-context.md, sezione "Archiviazione del Journey"), quindi il componente client
 * decide da sé se serve uno step di scelta oppure no.
 */
export async function QuickUpload() {
  const session = await getCurrentSession();
  if (!session) return null;

  const creator = await prisma.creator.findUnique({ where: { userId: session.user.id } });
  const activeJourneys = creator
    ? await prisma.journey.findMany({
        where: { creatorId: creator.id, status: { not: "ARCHIVED" } },
        orderBy: { updatedAt: "desc" },
        include: {
          chapters: {
            where: { deletedAt: null },
            orderBy: { order: "asc" },
            select: { id: true, title: true },
          },
        },
      })
    : [];

  // Solo i Journey "live" (Pubblicato o in Discovery) hanno una pagina pubblica raggiungibile:
  // un Update non può collegarsi a un Journey ancora in Bozza, il link porterebbe a un 404.
  const linkableJourneys = creator
    ? await prisma.journey.findMany({
        where: { creatorId: creator.id, status: { in: LIVE_JOURNEY_STATUSES } },
        orderBy: { updatedAt: "desc" },
        include: {
          episodes: {
            where: { deletedAt: null },
            orderBy: { order: "asc" },
            select: { id: true, title: true },
          },
        },
      })
    : [];

  return (
    <QuickUploadButton
      journeys={activeJourneys.map((journey) => ({
        id: journey.id,
        title: journey.title,
        chapters: journey.chapters,
      }))}
      linkableJourneys={linkableJourneys.map((journey) => ({
        id: journey.id,
        title: journey.title,
        episodes: journey.episodes,
      }))}
    />
  );
}
