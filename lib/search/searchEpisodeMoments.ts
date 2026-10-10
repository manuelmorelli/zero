import { prisma } from "@/lib/prisma";
import { isMomentsLibraryEnabled } from "@/lib/ai/episodeMoments";
import { embedGeminiText } from "@/lib/ai/gemini";
import { cosineSimilarity } from "@/lib/ai/embeddingSimilarity";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";
import { resolveAvatarUrl, resolveCoverUrl } from "@/lib/media/resolveCoverUrl";

export type EpisodeMomentSearchItem = {
  episodeId: string;
  journeyId: string;
  title: string;
  coverUrl: string | null;
  category: string | null;
  creatorName: string;
  creatorAvatarUrl: string | null;
  journeyScore?: number;
  timestampSec: number;
  /** La frase scritta dall'AI su quel momento: il motivo per cui questo episodio è un risultato. */
  reason: string;
};

// Sotto questa soglia la somiglianza è troppo debole per essere un vero risultato (confronto a
// occhio sui primi appunti di prova, 2026-10-10): meglio non mostrare nulla che mostrare un
// episodio a caso perché la libreria di appunti è ancora piccola. Condivisa con il Percorso su
// Misura (lib/search/composeCustomPath.ts), stessa soglia nei due posti.
export const MIN_SIMILARITY = 0.6;

/**
 * Tutti i momenti che si possono mostrare a chi guarda (episodio pubblicato con video, Journey
 * ancora vivo): query condivisa dalla ricerca per senso qui sotto e dal Percorso su Misura
 * (lib/search/composeCustomPath.ts), così il filtro "cosa si può mostrare" resta uguale nei due posti.
 */
export async function fetchEligibleMoments() {
  return prisma.episodeMoment.findMany({
    where: {
      episode: {
        videoKey: { not: null },
        deletedAt: null,
        publishedAt: { not: null },
        journey: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null },
      },
    },
    include: {
      episode: {
        include: {
          journey: { include: { creator: { include: { user: { select: { avatarUrl: true } } } } } },
        },
      },
    },
  });
}

export type EligibleMoment = Awaited<ReturnType<typeof fetchEligibleMoments>>[number];

/**
 * Tra momenti già ordinati per somiglianza, i migliori con un solo momento per episodio (il più
 * forte): evita che lo stesso episodio compaia più volte, sia nei risultati di ricerca sia nei
 * candidati passati al Percorso su Misura.
 */
export function pickTopPerEpisode(
  scored: { moment: EligibleMoment; similarity: number }[],
  limit: number
): EligibleMoment[] {
  const seenEpisodeIds = new Set<string>();
  const best: EligibleMoment[] = [];
  for (const entry of scored) {
    if (seenEpisodeIds.has(entry.moment.episodeId)) continue;
    seenEpisodeIds.add(entry.moment.episodeId);
    best.push(entry.moment);
    if (best.length >= limit) break;
  }
  return best;
}

/**
 * Aggiunge la foto di copertina/avatar risolta e il punteggio Journey ai momenti scelti, pronti
 * da mostrare: usata sia dalla ricerca per senso sia dal Percorso su Misura.
 */
export async function enrichMoments(moments: EligibleMoment[]): Promise<EpisodeMomentSearchItem[]> {
  const publishedJourneyIds = [
    ...new Set(moments.filter((moment) => moment.episode.journey.status === "PUBLISHED").map((moment) => moment.episode.journey.id)),
  ];
  await ensureFreshJourneyScores(publishedJourneyIds);
  const freshScores = publishedJourneyIds.length > 0
    ? await prisma.journey.findMany({ where: { id: { in: publishedJourneyIds } }, select: { id: true, journeyScore: true } })
    : [];
  const scoreByJourneyId = new Map(freshScores.map((journey) => [journey.id, journey.journeyScore]));

  const items = moments.map((moment) => ({
    episodeId: moment.episode.id,
    journeyId: moment.episode.journey.id,
    title: moment.episode.title,
    coverUrl: moment.episode.posterKey ?? moment.episode.journey.coverUrl,
    category: moment.episode.journey.category,
    creatorName: moment.episode.journey.creator.displayName,
    creatorAvatarUrl: moment.episode.journey.creator.user.avatarUrl,
    journeyScore: scoreByJourneyId.get(moment.episode.journey.id),
    timestampSec: moment.timestampSec,
    reason: moment.description,
  }));

  return Promise.all(
    items.map(async (item) => ({
      ...item,
      coverUrl: await resolveCoverUrl(item.coverUrl),
      creatorAvatarUrl: await resolveAvatarUrl(item.creatorAvatarUrl),
    }))
  );
}

/**
 * Ricerca "per senso" sulla Mappa dei Momenti (lib/ai/episodeMoments.ts): confronta la frase
 * scritta da chi cerca con gli appunti già salvati su ogni episodio e torna i più vicini, un
 * episodio al massimo per ogni risultato (il momento più forte di quell'episodio). Chiamata da
 * /search solo quando la ricerca normale per parole non trova nessun Journey (app/(site)/search/page.tsx),
 * mai al posto di quella. Torna sempre vuoto se MOMENTS_LIBRARY_ENABLED è spento.
 */
export async function searchEpisodeMoments(query: string, limit = 6): Promise<EpisodeMomentSearchItem[]> {
  if (!isMomentsLibraryEnabled()) return [];

  const trimmed = query.trim();
  if (!trimmed) return [];

  const queryEmbedding = await embedGeminiText(trimmed);
  if (!queryEmbedding) return [];

  const moments = await fetchEligibleMoments();
  const scored = moments
    .map((moment) => ({
      moment,
      similarity: cosineSimilarity(queryEmbedding, moment.embedding as number[]),
    }))
    .filter((entry) => entry.similarity >= MIN_SIMILARITY)
    .sort((a, b) => b.similarity - a.similarity);

  const best = pickTopPerEpisode(scored, limit);
  return enrichMoments(best);
}
