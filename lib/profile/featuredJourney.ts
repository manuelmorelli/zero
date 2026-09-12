import { prisma } from "@/lib/prisma";

export type FeaturedJourneyCandidate = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  category: string | null;
  /** Journey Score (0-100): il badge si mostra solo quando `status` è "PUBLISHED" (i Journey in
   * Discovery Phase non partecipano a questo punteggio, vedi lib/scoring/journeyScore.ts). */
  journeyScore: number;
  status: string;
};

/**
 * Il Journey "in evidenza" nel Profilo pubblico: tra i Journey pubblicati del creator, quello
 * che ha ricevuto l'episodio più recente. "Più recente" è per data di caricamento dell'episodio
 * (`createdAt`), non per la data reale dell'evento (`occurredAt`, che il creator può impostare
 * anche nel passato) — stesso principio già in uso per `Journey.publishedAt` (vedi
 * 00-project-context.md, sezione "Data di pubblicazione del Journey"). Un creator può avere più
 * Journey pubblicati in parallelo (vedi sezione "Archiviazione del Journey").
 */
export async function getFeaturedJourney(
  publishedJourneys: FeaturedJourneyCandidate[]
): Promise<FeaturedJourneyCandidate | null> {
  if (publishedJourneys.length === 0) return null;
  if (publishedJourneys.length === 1) return publishedJourneys[0];

  const latestEpisode = await prisma.episode.findFirst({
    where: {
      journeyId: { in: publishedJourneys.map((journey) => journey.id) },
      deletedAt: null,
      publishedAt: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: { journeyId: true },
  });

  const featuredId = latestEpisode?.journeyId;
  return publishedJourneys.find((journey) => journey.id === featuredId) ?? publishedJourneys[0];
}
