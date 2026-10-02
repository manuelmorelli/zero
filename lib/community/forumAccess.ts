import { prisma } from "@/lib/prisma";

/** Può scrivere nel forum di un Journey solo chi lo sta davvero facendo (JourneyProgress esiste già
 * in automatico, creato al primo episodio guardato — nessun pulsante "iscriviti al forum") più il
 * creator stesso, sempre. Leggere il forum non richiede nessun controllo: è pubblico. Condivisa tra
 * la pagina del forum (per mostrare o nascondere il composer) e la server action che pubblica. */
export async function canWriteInForum(journeyId: string, userId: string): Promise<boolean> {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    select: { creator: { select: { userId: true } } },
  });
  if (!journey) return false;
  if (journey.creator.userId === userId) return true;

  const progress = await prisma.journeyProgress.findUnique({
    where: { userId_journeyId: { userId, journeyId } },
    select: { id: true },
  });
  return Boolean(progress);
}
