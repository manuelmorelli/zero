"use server";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { MAX_MANUAL_HIGHLIGHTS, MIN_HIGHLIGHT_GAP_SECONDS } from "@/lib/constants/moments";

async function requireOwnedEpisode(episodeId: string) {
  const { creator } = await requireCreator();
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: { journey: true },
  });
  if (!episode || episode.journey.creatorId !== creator.id) notFound();
  return episode;
}

/**
 * La stellina sul proprio player (components/journey/HighlightMarker.tsx): il creator segna a
 * mano il secondo in corso come "momento migliore", al posto dell'AI (oggi spenta, vedi
 * lib/ai/episodeMoments.ts). Nessuna nota scritta, nessuna chiamata AI: solo il secondo.
 */
export async function addManualHighlight(episodeId: string, timestampSec: number): Promise<{ error: string } | { id: string }> {
  const episode = await requireOwnedEpisode(episodeId);
  const clampedTimestampSec = Math.max(0, Math.floor(timestampSec));

  const existing = await prisma.episodeMoment.findMany({
    where: { episodeId: episode.id, source: "CREATOR" },
    select: { timestampSec: true },
  });
  if (existing.length >= MAX_MANUAL_HIGHLIGHTS) {
    return { error: `You can mark at most ${MAX_MANUAL_HIGHLIGHTS} moments.` };
  }
  // Due momenti troppo vicini si sovrapporrebbero nel trailer (ogni taglio dura fino a
  // MIN_HIGHLIGHT_GAP_SECONDS, vedi lib/constants/moments.ts): niente di più vicino è ammesso.
  const tooClose = existing.some((moment) => Math.abs(moment.timestampSec - clampedTimestampSec) < MIN_HIGHLIGHT_GAP_SECONDS);
  if (tooClose) {
    return { error: `Choose a moment at least ${MIN_HIGHLIGHT_GAP_SECONDS} seconds away from your other marks.` };
  }

  const moment = await prisma.episodeMoment.create({
    data: {
      episodeId: episode.id,
      timestampSec: clampedTimestampSec,
      source: "CREATOR",
      isHighlight: true,
    },
  });

  // Nessun revalidatePath: la lista a schermo è già aggiornata dallo stato del client
  // (useHighlightMarker). Rigenerare la pagina qui rinnoverebbe anche l'URL firmato del video
  // (getVideoPlaybackUrl), facendolo ripartire da capo mentre il creator lo sta guardando.
  return { id: moment.id };
}

/** Togliere un punto segnato per sbaglio (lista sotto la stellina). */
export async function deleteManualHighlight(momentId: string): Promise<void> {
  const { creator } = await requireCreator();
  const moment = await prisma.episodeMoment.findUnique({
    where: { id: momentId },
    include: { episode: { include: { journey: true } } },
  });
  if (!moment || moment.episode.journey.creatorId !== creator.id) notFound();

  await prisma.episodeMoment.delete({ where: { id: momentId } });
  // Stesso motivo del commento in addManualHighlight: niente revalidatePath qui.
}
