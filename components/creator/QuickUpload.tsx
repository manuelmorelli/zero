import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { QuickUploadButton } from "@/components/creator/QuickUploadButton";

/**
 * Pulsante "+" globale (montato una sola volta in app/layout.tsx, visibile su tutto il sito
 * per chi è loggato): recupera qui, lato server, il Journey attivo e i suoi Capitoli, così il
 * componente client non deve andarli a cercare lui stesso al momento dell'apertura.
 */
export async function QuickUpload() {
  const session = await getCurrentSession();
  if (!session) return null;

  const creator = await prisma.creator.findUnique({ where: { userId: session.user.id } });
  const activeJourney = creator
    ? await prisma.journey.findFirst({
        where: { creatorId: creator.id, status: { not: "ARCHIVED" } },
        include: {
          chapters: {
            where: { deletedAt: null },
            orderBy: { order: "asc" },
            select: { id: true, title: true },
          },
        },
      })
    : null;

  return (
    <QuickUploadButton
      journeyId={activeJourney?.id ?? null}
      chapters={activeJourney?.chapters ?? []}
    />
  );
}
