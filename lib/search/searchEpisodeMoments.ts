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
// episodio a caso perché la libreria di appunti è ancora piccola.
const MIN_SIMILARITY = 0.6;

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

  const moments = await prisma.episodeMoment.findMany({
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

  const scored = moments
    .map((moment) => ({
      moment,
      similarity: cosineSimilarity(queryEmbedding, moment.embedding as number[]),
    }))
    .filter((entry) => entry.similarity >= MIN_SIMILARITY)
    .sort((a, b) => b.similarity - a.similarity);

  // Un solo risultato per episodio (il momento più forte): altrimenti lo stesso episodio potrebbe
  // comparire più volte con minuti diversi, confuso in una lista di risultati di ricerca.
  const seenEpisodeIds = new Set<string>();
  const best = [];
  for (const entry of scored) {
    if (seenEpisodeIds.has(entry.moment.episodeId)) continue;
    seenEpisodeIds.add(entry.moment.episodeId);
    best.push(entry.moment);
    if (best.length >= limit) break;
  }

  const publishedJourneyIds = [
    ...new Set(best.filter((moment) => moment.episode.journey.status === "PUBLISHED").map((moment) => moment.episode.journey.id)),
  ];
  await ensureFreshJourneyScores(publishedJourneyIds);
  const freshScores = publishedJourneyIds.length > 0
    ? await prisma.journey.findMany({ where: { id: { in: publishedJourneyIds } }, select: { id: true, journeyScore: true } })
    : [];
  const scoreByJourneyId = new Map(freshScores.map((journey) => [journey.id, journey.journeyScore]));

  const items = best.map((moment) => ({
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
