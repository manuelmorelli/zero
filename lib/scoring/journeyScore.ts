import { prisma } from "@/lib/prisma";

/**
 * Journey Score (0-100) — 08_Algorithm.md, "Journey Score". Entra in gioco solo per le sezioni
 * "bonus" di Discovery (Top Journeys, spinta extra dentro Recommended): non tocca mai le sezioni
 * base garantite a tutti dal primo secondo (New Journeys, Latest Videos, Feed, Discovering Now,
 * raccomandazioni per interesse). Un Journey in Discovery Phase non partecipa a questo punteggio:
 * il criterio di ranking prende il controllo solo dopo, quando lo stato torna PUBLISHED.
 */

// Sotto questa soglia di spettatori distinti, completamento ed engagement non contribuiscono
// (né in positivo né in negativo): troppo pochi dati per fidarsene, un Journey nuovo resta nella
// fascia base — mai nascosto né penalizzato, coerente con la fascia "0-25%" del documento.
const MIN_SAMPLE_SIZE = 5;

const FOLLOWERS_CAP = 500;
const LIKES_PER_EPISODE_CAP = 20;
const RECENCY_WINDOW_DAYS = 60;
const TARGET_EPISODES_PER_MONTH = 4;

/** Un punteggio più vecchio di 24 ore va ricalcolato alla prossima lettura (nessun cron job). */
const SCORE_STALE_AFTER_MS = 24 * 60 * 60 * 1000;

const WEIGHTS = {
  completion: 0.45,
  continuity: 0.25,
  engagement: 0.15,
  followers: 0.1,
  likes: 0.05,
} as const;

type ScoreInput = {
  journeyId: string;
  publishedAt: Date | null;
  followersCount: number;
};

/**
 * Ricalcola e salva su `Journey.journeyScore` i soli Journey, tra quelli passati, che non sono
 * mai stati valutati o il cui punteggio ha più di 24 ore (`journeyScoreUpdatedAt`). I chiamanti
 * leggono poi `journey.journeyScore` direttamente dalla riga già in mano — nessun ricalcolo ad
 * ogni richiesta, stesso principio già in uso per la scadenza degli Updates e la Discovery Phase
 * (pulizia/promozione lazy invece di un servizio in background).
 */
export async function ensureFreshJourneyScores(journeyIds: string[]): Promise<void> {
  if (journeyIds.length === 0) return;

  const staleThreshold = new Date(Date.now() - SCORE_STALE_AFTER_MS);
  const staleJourneys = await prisma.journey.findMany({
    where: {
      id: { in: journeyIds },
      OR: [{ journeyScoreUpdatedAt: null }, { journeyScoreUpdatedAt: { lt: staleThreshold } }],
    },
    select: {
      id: true,
      publishedAt: true,
      creator: { select: { _count: { select: { followers: true } } } },
    },
  });
  if (staleJourneys.length === 0) return;

  const scores = await computeJourneyScores(
    staleJourneys.map((journey) => ({
      journeyId: journey.id,
      publishedAt: journey.publishedAt,
      followersCount: journey.creator._count.followers,
    }))
  );

  const now = new Date();
  await Promise.all(
    staleJourneys.map((journey) =>
      prisma.journey.update({
        where: { id: journey.id },
        data: { journeyScore: scores.get(journey.id) ?? 0, journeyScoreUpdatedAt: now },
      })
    )
  );
}

async function computeJourneyScores(inputs: ScoreInput[]): Promise<Map<string, number>> {
  const journeyIds = inputs.map((input) => input.journeyId);

  const episodes = await prisma.episode.findMany({
    where: {
      journeyId: { in: journeyIds },
      deletedAt: null,
      OR: [{ chapterId: null }, { chapter: { deletedAt: null } }],
    },
    select: { id: true, journeyId: true, createdAt: true },
  });
  const episodeIds = episodes.map((episode) => episode.id);

  const [progress, likeCounts] = await Promise.all([
    episodeIds.length > 0
      ? prisma.episodeProgress.findMany({
          where: { episodeId: { in: episodeIds } },
          select: { userId: true, episodeId: true, completedAt: true },
        })
      : Promise.resolve([]),
    episodeIds.length > 0
      ? prisma.like.groupBy({
          by: ["targetId"],
          where: { targetType: "EPISODE", targetId: { in: episodeIds } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ]);

  const episodeToJourney = new Map(episodes.map((episode) => [episode.id, episode.journeyId]));
  const likesByEpisode = new Map(likeCounts.map((row) => [row.targetId, row._count._all]));

  const episodesByJourney = new Map<string, { id: string; createdAt: Date }[]>();
  for (const episode of episodes) {
    const list = episodesByJourney.get(episode.journeyId) ?? [];
    list.push({ id: episode.id, createdAt: episode.createdAt });
    episodesByJourney.set(episode.journeyId, list);
  }

  // Per Journey, statistiche per spettatore distinto: quanti episodi ha iniziato e quanti finiti
  // (EpisodeProgress.completedAt). Base sia per il completamento a fasce sia per l'engagement.
  const viewerStatsByJourney = new Map<string, Map<string, { started: number; completed: number }>>();
  for (const row of progress) {
    const journeyId = episodeToJourney.get(row.episodeId);
    if (!journeyId) continue;
    const journeyViewers = viewerStatsByJourney.get(journeyId) ?? new Map();
    const viewer = journeyViewers.get(row.userId) ?? { started: 0, completed: 0 };
    viewer.started += 1;
    if (row.completedAt) viewer.completed += 1;
    journeyViewers.set(row.userId, viewer);
    viewerStatsByJourney.set(journeyId, journeyViewers);
  }

  const scores = new Map<string, number>();
  const now = Date.now();

  for (const input of inputs) {
    const journeyEpisodes = episodesByJourney.get(input.journeyId) ?? [];
    const totalEpisodes = journeyEpisodes.length;
    const viewers = [...(viewerStatsByJourney.get(input.journeyId)?.values() ?? [])];
    const sampleSize = viewers.length;
    const hasEnoughSample = sampleSize >= MIN_SAMPLE_SIZE && totalEpisodes > 0;

    // Journey completato = un viewer ha finito almeno il 90% degli episodi (08_Algorithm.md).
    const completionShare = hasEnoughSample
      ? viewers.filter((viewer) => viewer.completed / totalEpisodes >= 0.9).length / sampleSize
      : 0;
    const completionScore = hasEnoughSample ? completionBand(completionShare) : 0;

    // Engagement = profondità media raggiunta da chi ha iniziato il Journey (tempo di fruizione
    // reale), distinto dal completamento: premia anche chi non finisce ma va avanti parecchio.
    const engagementDepth = hasEnoughSample
      ? viewers.reduce((sum, viewer) => sum + viewer.started / totalEpisodes, 0) / sampleSize
      : 0;
    const engagementScore = hasEnoughSample ? engagementDepth * 100 : 0;

    const continuityScore = computeContinuityScore(
      journeyEpisodes.map((episode) => episode.createdAt),
      input.publishedAt,
      now
    );

    const followersScore = (Math.min(input.followersCount, FOLLOWERS_CAP) / FOLLOWERS_CAP) * 100;

    const totalLikes = journeyEpisodes.reduce(
      (sum, episode) => sum + (likesByEpisode.get(episode.id) ?? 0),
      0
    );
    const likesPerEpisode = totalEpisodes > 0 ? totalLikes / totalEpisodes : 0;
    const likesScore = (Math.min(likesPerEpisode, LIKES_PER_EPISODE_CAP) / LIKES_PER_EPISODE_CAP) * 100;

    const score =
      completionScore * WEIGHTS.completion +
      continuityScore * WEIGHTS.continuity +
      engagementScore * WEIGHTS.engagement +
      followersScore * WEIGHTS.followers +
      likesScore * WEIGHTS.likes;

    scores.set(input.journeyId, Math.round(Math.max(0, Math.min(score, 100))));
  }

  return scores;
}

/**
 * Effetto a fasce del completamento, non lineare (08_Algorithm.md): solo l'effetto (spinta extra
 * nel ranking) è osservabile, mai la percentuale in sé — niente barra di progresso per il creator.
 */
function completionBand(completionShare: number): number {
  if (completionShare < 0.25) return 0;
  if (completionShare < 0.5) return 25;
  if (completionShare < 0.75) return 50;
  if (completionShare < 0.9) return 75;
  return 100; // Super Hero Level
}

/** Media tra "quanto è recente l'ultimo episodio" e "quanto pubblica di frequente il creator". */
function computeContinuityScore(episodeDates: Date[], publishedAt: Date | null, now: number): number {
  if (episodeDates.length === 0) return 0;

  const lastEpisodeAt = Math.max(...episodeDates.map((date) => date.getTime()));
  const daysSinceLastEpisode = (now - lastEpisodeAt) / (24 * 60 * 60 * 1000);
  const recencyScore = Math.max(0, 1 - daysSinceLastEpisode / RECENCY_WINDOW_DAYS);

  const firstEpisodeAt = Math.min(...episodeDates.map((date) => date.getTime()));
  const since = publishedAt ?? new Date(firstEpisodeAt);
  const monthsSincePublished = Math.max((now - since.getTime()) / (30 * 24 * 60 * 60 * 1000), 1 / 30);
  const episodesPerMonth = episodeDates.length / monthsSincePublished;
  const frequencyScore = Math.min(episodesPerMonth / TARGET_EPISODES_PER_MONTH, 1);

  return ((recencyScore + frequencyScore) / 2) * 100;
}
