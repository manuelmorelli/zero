import { prisma } from "@/lib/prisma";
import { isBlockedEitherWay } from "@/lib/block";

/** Può scrivere nel forum di un Journey solo chi lo sta davvero facendo (JourneyProgress esiste già
 * in automatico, creato al primo episodio guardato — nessun pulsante "iscriviti al forum") più il
 * creator stesso, sempre. Un utente bloccato dal creator (Settings > Privacy, lib/block.ts) non può
 * scrivere, qualunque sia il suo avanzamento: è così che il creator modera il proprio forum oltre a
 * poter cancellare i singoli messaggi. Leggere il forum non richiede nessun controllo: è pubblico.
 * Condivisa tra la pagina del forum (per mostrare o nascondere il composer) e la server action che
 * pubblica. */
export async function canWriteInForum(journeyId: string, userId: string): Promise<boolean> {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    select: { creator: { select: { userId: true } } },
  });
  if (!journey) return false;
  if (journey.creator.userId === userId) return true;

  if (await isBlockedEitherWay(journey.creator.userId, userId)) return false;

  const progress = await prisma.journeyProgress.findUnique({
    where: { userId_journeyId: { userId, journeyId } },
    select: { id: true },
  });
  return Boolean(progress);
}
