import { prisma } from "@/lib/prisma";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";

/**
 * Trust Level del creator (0-100), mostrato come "Trust Score" nell'Hero del Profilo pubblico
 * (08_Algorithm.md, "Trust Level"). Sale con continuità e qualità dei Journey pubblicati (media
 * del loro Journey Score, vedi lib/scoring/journeyScore.ts) e con i follower (cappati, come per
 * il Journey Score, per non premiare solo la scala). Scende solo per segnalazioni confermate
 * manualmente: nessun rilevamento automatico di manipolazione, fuori scope per ora.
 */

const FOLLOWERS_CAP = 500;
const REPORT_PENALTY = 10;

export type TrustScoreInput = {
  followersCount: number;
  /** Media del Journey Score (0-100) dei Journey pubblicati del creator; 0 se non ne ha. */
  averageJourneyScore: number;
  /** Il creator ha almeno un Journey pubblicato o in Discovery Phase. */
  hasLiveJourney: boolean;
  /** Numero di Report confermati (status RESOLVED) verso questo creator. */
  confirmedReportsCount: number;
};

export function computeTrustScore({
  followersCount,
  averageJourneyScore,
  hasLiveJourney,
  confirmedReportsCount,
}: TrustScoreInput): number {
  const base = 30;
  const followersContribution = (Math.min(followersCount, FOLLOWERS_CAP) / FOLLOWERS_CAP) * 20;
  const qualityContribution = (averageJourneyScore / 100) * 40;
  const liveJourneyBonus = hasLiveJourney ? 10 : 0;
  const reportPenalty = confirmedReportsCount * REPORT_PENALTY;

  const score = base + followersContribution + qualityContribution + liveJourneyBonus - reportPenalty;
  return Math.round(Math.max(0, Math.min(score, 100)));
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
  const [publishedJourneys, liveJourneyCount, confirmedReportsCount] = await Promise.all([
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
    followersCount,
    averageJourneyScore: Math.round(averageJourneyScore),
    hasLiveJourney: liveJourneyCount > 0,
    confirmedReportsCount,
  };
}
