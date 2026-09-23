import { prisma } from "@/lib/prisma";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";

/**
 * Trust Level del creator (0-100), mostrato come "Trust Score" nell'Hero del Profilo pubblico
 * (08_Algorithm.md, "Trust Level"). Si attiva solo dopo il caricamento del video/card di
 * presentazione (`Creator.presentationVideoUrl`): prima di allora `computeTrustScore` ritorna
 * `null` e il badge non va mostrato da nessuna parte, invece di mostrare uno zero fuorviante.
 */

const PRESENTATION_BONUS = 5;
const TRUSTY_MAX = 25;
// Sotto questa soglia di completamenti distinti su un episodio, il suo Trusty non entra nella
// media (troppo pochi dati per fidarsene) — stesso principio di MIN_SAMPLE_SIZE in journeyScore.ts.
const TRUSTY_MIN_SAMPLE = 5;
const FOLLOWERS_CAP = 500;
const FOLLOWERS_WEIGHT = 15;
const QUALITY_WEIGHT = 50;
const LIVE_JOURNEY_BONUS = 5;
const REPORT_PENALTY = 10;
// Tetto legato all'esperienza del creator: sotto questa soglia di episodi pubblicati, il punteggio
// finale viene scalato in proporzione, anche se tutte le altre metriche fossero perfette. Impedisce
// che un creator con pochissimi contenuti (es. 2 episodi) arrivi al 100% grazie a pochi amici che
// completano e "trustano" tutto.
const TRACK_RECORD_EPISODES = 10;

export type TrustScoreInput = {
  hasPresentation: boolean;
  /** 0-25, già cappato: media della quota di completatori che hanno anche dato Trusty, vedi getTrustyContribution. */
  trustyContribution: number;
  followersCount: number;
  /** Media del Journey Score (0-100) dei Journey pubblicati del creator; 0 se non ne ha. */
  averageJourneyScore: number;
  /** Il creator ha almeno un Journey pubblicato o in Discovery Phase. */
  hasLiveJourney: boolean;
  /** Numero di Report confermati (status RESOLVED) verso questo creator. */
  confirmedReportsCount: number;
  /** Episodi pubblicati (published + discovery) su tutti i Journey del creator. */
  publishedEpisodesCount: number;
};

export function computeTrustScore({
  hasPresentation,
  trustyContribution,
  followersCount,
  averageJourneyScore,
  hasLiveJourney,
  confirmedReportsCount,
  publishedEpisodesCount,
}: TrustScoreInput): number | null {
  if (!hasPresentation) return null;

  const followersContribution = (Math.min(followersCount, FOLLOWERS_CAP) / FOLLOWERS_CAP) * FOLLOWERS_WEIGHT;
  const qualityContribution = (averageJourneyScore / 100) * QUALITY_WEIGHT;
  const liveJourneyBonus = hasLiveJourney ? LIVE_JOURNEY_BONUS : 0;
  const reportPenalty = confirmedReportsCount * REPORT_PENALTY;

  const trackRecordFactor = Math.min(publishedEpisodesCount / TRACK_RECORD_EPISODES, 1);

  const rawScore =
    PRESENTATION_BONUS +
    Math.min(trustyContribution, TRUSTY_MAX) +
    followersContribution +
    qualityContribution +
    liveJourneyBonus;

  const score = rawScore * trackRecordFactor - reportPenalty;

  return Math.round(Math.max(0, Math.min(score, 100)));
}

/**
 * Per ogni episodio pubblicato del creator con almeno `TRUSTY_MIN_SAMPLE` completamenti distinti,
 * calcola la quota di quei completatori che hanno anche cliccato "Trusty" (0-1). La media di questa
 * quota sugli episodi che hanno abbastanza dati, scalata su `TRUSTY_MAX`, è il contributo al Trust
 * Score. Un episodio senza abbastanza completamenti reali non conta né in positivo né in negativo:
 * evita che pochi amici bastino a portare il Trusty al massimo.
 */
async function getTrustyContribution(episodeIds: string[]): Promise<number> {
  if (episodeIds.length === 0) return 0;

  const [completions, trustyClicks] = await Promise.all([
    prisma.episodeProgress.groupBy({
      by: ["episodeId"],
      where: { episodeId: { in: episodeIds }, completedAt: { not: null } },
      _count: { _all: true },
    }),
    prisma.like.groupBy({
      by: ["targetId"],
      where: { targetType: "EPISODE", targetId: { in: episodeIds } },
      _count: { _all: true },
    }),
  ]);

  const trustyByEpisode = new Map(trustyClicks.map((row) => [row.targetId, row._count._all]));

  const ratios = completions
    .filter((row) => row._count._all >= TRUSTY_MIN_SAMPLE)
    .map((row) => Math.min((trustyByEpisode.get(row.episodeId) ?? 0) / row._count._all, 1));

  if (ratios.length === 0) return 0;

  const averageRatio = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
  return averageRatio * TRUSTY_MAX;
}

/**
 * Raccoglie gli input reali per `computeTrustScore` di un creator. La media qualità guarda solo
 * ai Journey già usciti dalla Discovery Phase (PUBLISHED): quelli ancora in DISCOVERY sono troppo
 * recenti per avere un Journey Score affidabile (vedi lib/scoring/journeyScore.ts).
 */
export async function getCreatorTrustInputs(
  creatorId: string,
  followersCount: number
): Promise<TrustScoreInput> {
  const [creator, publishedJourneys, liveEpisodes, confirmedReportsCount] = await Promise.all([
    prisma.creator.findUnique({ where: { id: creatorId }, select: { presentationVideoUrl: true } }),
    prisma.journey.findMany({
      where: { creatorId, status: "PUBLISHED", deletedAt: null },
      select: { id: true, journeyScore: true },
    }),
    prisma.episode.findMany({
      where: {
        journey: { creatorId, status: { in: ["PUBLISHED", "DISCOVERY"] }, deletedAt: null },
        deletedAt: null,
        publishedAt: { not: null },
      },
      select: { id: true },
    }),
    prisma.report.count({
      where: { targetType: "CREATOR", targetId: creatorId, status: "RESOLVED" },
    }),
  ]);

  const trustyContribution = await getTrustyContribution(liveEpisodes.map((episode) => episode.id));

  let averageJourneyScore = 0;
  if (publishedJourneys.length > 0) {
    await ensureFreshJourneyScores(publishedJourneys.map((journey) => journey.id));
    const refreshed = await prisma.journey.findMany({
      where: { id: { in: publishedJourneys.map((journey) => journey.id) } },
      select: { journeyScore: true },
    });
    averageJourneyScore =
      refreshed.reduce((sum, journey) => sum + journey.journeyScore, 0) / refreshed.length;
  }

  return {
    hasPresentation: creator?.presentationVideoUrl != null,
    trustyContribution,
    followersCount,
    averageJourneyScore: Math.round(averageJourneyScore),
    hasLiveJourney: liveEpisodes.length > 0,
    confirmedReportsCount,
    publishedEpisodesCount: liveEpisodes.length,
  };
}
