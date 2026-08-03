"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

// Chiamata dal click su "Watch video" nella pagina pubblica del Journey.
// Nessun login richiesto per guardare: se l'utente non è autenticato, non fa nulla.
export async function recordEpisodeProgress(episodeId: string): Promise<void> {
  const session = await getCurrentSession();
  if (!session) return;

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
  });
  if (!episode) return;

  await prisma.journeyProgress.upsert({
    where: {
      userId_journeyId: { userId: session.user.id, journeyId: episode.journeyId },
    },
    create: {
      userId: session.user.id,
      journeyId: episode.journeyId,
      currentEpisodeId: episode.id,
    },
    update: {
      currentEpisodeId: episode.id,
    },
  });
}
