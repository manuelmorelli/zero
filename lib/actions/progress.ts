"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

// Chiamata dal player (EpisodeVideoPlayer.tsx): salvataggio periodico durante la riproduzione,
// in pausa, e alla chiusura della pagina. Nessun login richiesto per guardare: se l'utente non è
// autenticato, non fa nulla. `completed` arriva già calcolato dal player (fine video o soglia
// raggiunta) — una volta completato un episodio resta completato, anche se l'utente torna indietro
// nel video in un secondo momento.
export async function saveEpisodeProgress(
  episodeId: string,
  positionSec: number,
  completed: boolean
): Promise<void> {
  const session = await getCurrentSession();
  if (!session) return;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) return;

  const userId = session.user.id;
  const clampedPositionSec = Math.max(0, Math.floor(positionSec));

  await prisma.episodeProgress.upsert({
    where: { userId_episodeId: { userId, episodeId } },
    create: {
      userId,
      episodeId,
      positionSec: clampedPositionSec,
      completedAt: completed ? new Date() : null,
    },
    update: {
      positionSec: clampedPositionSec,
    },
  });

  if (completed) {
    await prisma.episodeProgress.updateMany({
      where: { userId, episodeId, completedAt: null },
      data: { completedAt: new Date() },
    });
  }

  await prisma.journeyProgress.upsert({
    where: {
      userId_journeyId: { userId, journeyId: episode.journeyId },
    },
    create: {
      userId,
      journeyId: episode.journeyId,
      currentEpisodeId: episode.id,
    },
    update: {
      currentEpisodeId: episode.id,
    },
  });
}
