import { prisma } from "@/lib/prisma";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";

/**
 * Trust Level del creator (0-100), mostrato come "Trust Score" nell'Hero del Profilo pubblico
 * (08_Algorithm.md, "Trust Level"). Si attiva solo dopo il caricamento del video/card di
 * presentazione (`Creator.presentationVideoUrl`): prima di allora `computeTrustScore` ritorna
 * `null` e il badge non va mostrato da nessuna parte, invece di mostrare uno zero fuorviante.
 */

const PRESENTATION_BONUS = 10;
const TRUSTY_MAX = 2;
const TRUSTY_PER_EPISODE_CAP = 20;
const FOLLOWERS_CAP = 500;
const FOLLOWERS_WEIGHT = 20;
const QUALITY_WEIGHT = 58;
const LIVE_JOURNEY_BONUS = 10;
const REPORT_PENALTY = 10;

export type TrustScoreInput = {
  hasPresentation: boolean;
  /** 0-2, già cappato: media di click "Trusty" per episodio, vedi getTrustyContribution. */
  trustyContribution: number;
  followersCount: number;
  /** Media del Journey Score (0-100) dei Journey pubblicati del creator; 0 se non ne ha. */
  averageJourneyScore: number;
  /** Il creator ha almeno un Journey pubblicato o in Discovery Phase. */
  hasLiveJourney: boolean;
  /** Numero di Report confermati (status RESOLVED) verso questo creator. */
  confirmedReportsCount: number;
};

export function computeTrustScore({
  hasPresentation,
  trustyContribution,
  followersCount,
  averageJourneyScore,
  hasLiveJourney,
  confirmedReportsCount,
}: TrustScoreInput): number | null {
  if (!hasPresentation) return null;

  const followersContribution = (Math.min(followersCount, FOLLOWERS_CAP) / FOLLOWERS_CAP) * FOLLOWERS_WEIGHT;
  const qualityContribution = (averageJourneyScore / 100) * QUALITY_WEIGHT;
  const liveJourneyBonus = hasLiveJourney ? LIVE_JOURNEY_BONUS : 0;
  const reportPenalty = confirmedReportsCount * REPORT_PENALTY;

  const score =
    PRESENTATION_BONUS +
    Math.min(trustyContribution, TRUSTY_MAX) +
    followersContribution +
    qualityContribution +
    liveJourneyBonus -
    reportPenalty;

  return Math.round(Math.max(0, Math.min(score, 100)));
}

/**
 * Media di click "Trusty" per episodio pubblicato del creator (published + discovery), cappata a
 * `TRUSTY_PER_EPISODE_CAP` per episodio — stesso principio dei follower cappati: oltre la soglia,
 * accumularne di più non alza ulteriormente il contributo al Trust Score.
 */
async function getTrustyContribution(creatorId: string): Promise<number> {
  const episodes = await prisma.episode.findMany({
    where: {
      journey: { creatorId, status: { in: ["PUBLISHED", "DISCOVERY"] }, deletedAt: null },
      deletedAt: null,
      publishedAt: { not: null },
    },
    select: { id: true },
  });
  if (episodes.length === 0) return 0;

  const trustyCount = await prisma.like.count({
    where: { targetType: "EPISODE", targetId: { in: episodes.map((episode) => episode.id) } },
  });

  const trustyPerEpisode = trustyCount / episodes.length;
  return (Math.min(trustyPerEpisode, TRUSTY_PER_EPISODE_CAP) / TRUSTY_PER_EPISODE_CAP) * TRUSTY_MAX;
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
  const [creator, publishedJourneys, liveJourneyCount, confirmedReportsCount, trustyContribution] =
    await Promise.all([
      prisma.creator.findUnique({ where: { id: creatorId }, select: { presentationVideoUrl: true } }),
      prisma.journey.findMany({
        where: { creatorId, status: "PUBLISHED", deletedAt: null },
        select: { id: true, journeyScore: true },
      }),
      prisma.journey.count({
        where: { creatorId, status: { in: ["PUBLISHED", "DISCOVERY"] }, deletedAt: null },
      }),
      prisma.report.count({
        where: { targetType: "CREATOR", targetId: creatorId, status: "RESOLVED" },
      }),
      getTrustyContribution(creatorId),
    ]);

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
    hasLiveJourney: liveJourneyCount > 0,
    confirmedReportsCount,
  };
}
