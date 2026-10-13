import { prisma } from "@/lib/prisma";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";
import { PUBLICLY_REACHABLE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";

/**
 * Trust Level del creator (0-100), mostrato come "Trust Score" nell'Hero del Profilo pubblico
 * (08_Algorithm.md, "Trust Level"). Si attiva solo dopo il caricamento del video/card di
 * presentazione (`Creator.presentationVideoUrl`): prima di allora `computeTrustScore` ritorna
 * `null` e il badge non va mostrato da nessuna parte, invece di mostrare uno zero fuorviante.
 * Non entra in nessuna classifica: è solo un'informazione mostrata.
 */

const PRESENTATION_BONUS = 5;
const TRUSTY_MAX = 25;
// Sotto questa soglia di completamenti distinti su un episodio, il suo Trusty non entra nella
// media (troppo pochi dati per fidarsene) — stesso principio di MIN_SAMPLE_SIZE in journeyScore.ts.
const TRUSTY_MIN_SAMPLE = 5;
const FOLLOWERS_CAP = 500;
const FOLLOWERS_WEIGHT = 15;
const QUALITY_WEIGHT = 50;
const ACTIVE_BONUS = 5;
const REPORT_PENALTY = 10;
// Tetto legato all'esperienza del creator: sotto questa soglia di episodi pubblicati, il punteggio
// finale viene scalato in proporzione, anche se tutte le altre metriche fossero perfette. Impedisce
// che un creator con pochissimi contenuti (es. 2 episodi) arrivi al 100% grazie a pochi amici che
// completano e "trustano" tutto.
const TRACK_RECORD_EPISODES = 10;
// I pezzi che vengono dagli spettatori (Trusty e qualità) crescono col numero di persone diverse
// che hanno finito almeno un episodio del creator, e sono pieni solo da qui in su. Non riconosce
// chi è amico: dà poco peso a qualunque pubblico piccolo, così pochi account compiacenti non bastano.
const AUDIENCE_FULL_WEIGHT = 100;

export type TrustScoreInput = {
  hasPresentation: boolean;
  /** 0-25, già cappato: media della quota di completatori che hanno anche dato Trusty, vedi getTrustyContribution. */
  trustyContribution: number;
  followersCount: number;
  /** Media del Journey Score (0-100) dei Journey pubblicati del creator; 0 se non ne ha. */
  averageJourneyScore: number;
  /** Persone diverse (creator escluso) che hanno finito almeno un episodio del creator. */
  audienceCount: number;
  /** Ha almeno un Journey online e non ha ancora ricevuto avvisi di inattività (6 mesi, 10 in pausa). */
  isActive: boolean;
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
  audienceCount,
  isActive,
  confirmedReportsCount,
  publishedEpisodesCount,
}: TrustScoreInput): number | null {
  if (!hasPresentation) return null;

  const audienceFactor = Math.min(audienceCount / AUDIENCE_FULL_WEIGHT, 1);
  const trustyPart = Math.min(trustyContribution, TRUSTY_MAX) * audienceFactor;
  const followersContribution = (Math.min(followersCount, FOLLOWERS_CAP) / FOLLOWERS_CAP) * FOLLOWERS_WEIGHT;
  const qualityContribution = (averageJourneyScore / 100) * QUALITY_WEIGHT * audienceFactor;
  const activeBonus = isActive ? ACTIVE_BONUS : 0;
  const reportPenalty = confirmedReportsCount * REPORT_PENALTY;

  const trackRecordFactor = Math.min(publishedEpisodesCount / TRACK_RECORD_EPISODES, 1);

  const rawScore = PRESENTATION_BONUS + trustyPart + followersContribution + qualityContribution + activeBonus;

  const score = rawScore * trackRecordFactor - reportPenalty;

  return Math.round(Math.max(0, Math.min(score, 100)));
}

/**
 * Per ogni episodio pubblicato del creator con almeno `TRUSTY_MIN_SAMPLE` completamenti distinti,
 * calcola la quota di quei completatori che hanno anche cliccato "Trusty" (0-1). La media di questa
 * quota sugli episodi che hanno abbastanza dati, scalata su `TRUSTY_MAX`, è il contributo al Trust
 * Score. Un episodio senza abbastanza completamenti reali non conta né in positivo né in negativo.
 * Il creator non conta mai, né tra i completatori né tra chi ha dato Trusty.
 */
async function getTrustyContribution(episodeIds: string[], creatorUserId: string): Promise<number> {
  if (episodeIds.length === 0) return 0;

  const [completions, trustyClicks] = await Promise.all([
    prisma.episodeProgress.groupBy({
      by: ["episodeId"],
      where: { episodeId: { in: episodeIds }, completedAt: { not: null }, userId: { not: creatorUserId } },
      _count: { _all: true },
    }),
    prisma.like.groupBy({
      by: ["targetId"],
      // Esclusi gli eventuali Trusty che il creator si era dato da solo prima del blocco in lib/actions/like.ts.
      where: { targetType: "EPISODE", targetId: { in: episodeIds }, userId: { not: creatorUserId } },
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

async function countDistinctCompleters(episodeIds: string[], creatorUserId: string): Promise<number> {
  if (episodeIds.length === 0) return 0;
  const rows = await prisma.episodeProgress.groupBy({
    by: ["userId"],
    where: { episodeId: { in: episodeIds }, completedAt: { not: null }, userId: { not: creatorUserId } },
  });
  return rows.length;
}

/**
 * Raccoglie gli input reali per `computeTrustScore` di un creator. La media qualità guarda solo
 * ai Journey già usciti dalla Discovery Phase (PUBLISHED): quelli ancora in DISCOVERY sono troppo
 * recenti per avere un Journey Score affidabile (vedi lib/scoring/journeyScore.ts).
 */
async function getCreatorTrustInputs(
  creator: { id: string; userId: string; presentationVideoUrl: string | null; inactivityNoticeStage: number },
  followersCount: number
): Promise<TrustScoreInput> {
  const [publishedJourneys, liveEpisodes, confirmedReportsCount] = await Promise.all([
    prisma.journey.findMany({
      where: { creatorId: creator.id, status: "PUBLISHED", deletedAt: null },
      select: { id: true },
    }),
    prisma.episode.findMany({
      where: {
        journey: { creatorId: creator.id, status: { in: ["PUBLISHED", "DISCOVERY"] }, deletedAt: null },
        deletedAt: null,
        publishedAt: { not: null },
      },
      select: { id: true },
    }),
    prisma.report.count({
      where: { targetType: "CREATOR", targetId: creator.id, status: "RESOLVED" },
    }),
  ]);

  const liveEpisodeIds = liveEpisodes.map((episode) => episode.id);
  const [trustyContribution, audienceCount] = await Promise.all([
    getTrustyContribution(liveEpisodeIds, creator.userId),
    countDistinctCompleters(liveEpisodeIds, creator.userId),
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
    hasPresentation: creator.presentationVideoUrl != null,
    trustyContribution,
    followersCount,
    averageJourneyScore: Math.round(averageJourneyScore),
    audienceCount,
    isActive: liveEpisodes.length > 0 && creator.inactivityNoticeStage === 0,
    confirmedReportsCount,
    publishedEpisodesCount: liveEpisodes.length,
  };
}

/**
 * Persone diverse che hanno dato Trusty ad almeno un episodio del creator ("1,240 people trust this
 * creator"), creator escluso. Conta anche i Journey archiviati: chi si è fidato resta tale.
 */
async function countTrustedBy(creatorId: string, creatorUserId: string): Promise<number> {
  const episodes = await prisma.episode.findMany({
    where: {
      journey: { creatorId, status: { in: PUBLICLY_REACHABLE_JOURNEY_STATUSES }, deletedAt: null },
      deletedAt: null,
      publishedAt: { not: null },
    },
    select: { id: true },
  });
  if (episodes.length === 0) return 0;
  const rows = await prisma.like.groupBy({
    by: ["userId"],
    where: { targetType: "EPISODE", targetId: { in: episodes.map((episode) => episode.id) }, userId: { not: creatorUserId } },
  });
  return rows.length;
}

export type CreatorTrust = {
  /** null finché il creator non carica il video di presentazione. */
  score: number | null;
  trustedByCount: number;
};

export async function getCreatorTrust(creatorId: string, followersCount: number): Promise<CreatorTrust> {
  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    select: { id: true, userId: true, presentationVideoUrl: true, inactivityNoticeStage: true },
  });
  if (!creator) return { score: null, trustedByCount: 0 };

  const [inputs, trustedByCount] = await Promise.all([
    getCreatorTrustInputs(creator, followersCount),
    countTrustedBy(creator.id, creator.userId),
  ]);
  return { score: computeTrustScore(inputs), trustedByCount };
}
