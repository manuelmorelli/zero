// Punteggio "Trust Score" mostrato nell'Hero del Profilo pubblico. Non esiste ancora un vero
// Trust System (vedi "Trust First" in docs/08_Algorithm.md e il modello Analytics, oggi non
// popolato da nessun job): questo è un placeholder onesto, calcolato da segnali reali già
// disponibili (follower, continuità di pubblicazione), non un numero inventato a caso. Andrà
// sostituito quando il vero Trust System sarà implementato — nessun'altra parte del prodotto
// dipende da questo calcolo.
type TrustScoreInput = {
  followersCount: number;
  publishedEpisodesCount: number;
  hasPublishedJourney: boolean;
};

export function computeTrustScore({
  followersCount,
  publishedEpisodesCount,
  hasPublishedJourney,
}: TrustScoreInput): number {
  const base = 40;
  const followersContribution = Math.min(followersCount, 500) * 0.05;
  const continuityContribution = Math.min(publishedEpisodesCount, 50) * 0.6;
  const publishedJourneyBonus = hasPublishedJourney ? 10 : 0;

  const score = base + followersContribution + continuityContribution + publishedJourneyBonus;
  return Math.round(Math.min(score, 100));
}
