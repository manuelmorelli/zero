import { prisma } from "@/lib/prisma";
import type { JourneyCardData } from "@/components/journey/JourneyCard";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";
import { DEMO_JOURNEYS } from "@/lib/demo/demoJourneys";
import { ensureFreshJourneyScores } from "@/lib/scoring/journeyScore";
import { withResolvedJourneyCardUrls } from "@/lib/media/resolveCoverUrl";

/**
 * Ultimi Journey pubblicati su tutta la piattaforma. Se l'utente ha interessi dichiarati, quelli
 * nelle sue categorie vengono mostrati per primi, mantenendo comunque l'ordine dal più recente al
 * meno recente sia tra i match sia tra il resto.
 */
export async function getNewJourneys(
  excludeJourneyIds: string[] = [],
  interests: string[] = [],
  limit = 5
): Promise<JourneyCardData[]> {
  // Se l'utente ha interessi dichiarati, si guarda un gruppo più ampio di Journey recenti
  // per poter dare priorità a quelli nelle sue categorie, mantenendo comunque l'ordine
  // dal più recente al meno recente sia tra i match sia tra il resto (vedi sotto).
  const pool = interests.length > 0 ? Math.max(limit * 4, 20) : limit;

  const journeys = await prisma.journey.findMany({
    where: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null, id: { notIn: excludeJourneyIds } },
    orderBy: { publishedAt: "desc" },
    take: pool,
    include: { creator: { include: { user: { select: { avatarUrl: true } } } } },
  });

  if (journeys.length === 0) {
    // Nessun risultato può voler dire "nessun Journey pubblicato" (mostra la demo) oppure
    // "tutti i Journey pubblicati sono già esclusi" (es. tutti nel Feed): solo nel primo caso
    // ha senso il fallback demo, altrimenti la sezione resta vuota di proposito.
    const anyPublished = await prisma.journey.count({
      where: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null },
    });
    return anyPublished === 0 ? DEMO_JOURNEYS : [];
  }

  const ordered = interests.length === 0
    ? journeys
    : (() => {
        const interestSet = new Set(interests);
        const matching = journeys.filter((journey) => journey.category && interestSet.has(journey.category));
        const rest = journeys.filter((journey) => !(journey.category && interestSet.has(journey.category)));
        return [...matching, ...rest];
      })();

  const selected = ordered.slice(0, limit);

  // Il badge del punteggio si mostra solo per i Journey già PUBLISHED: quelli in Discovery Phase
  // non partecipano al Journey Score (vedi lib/scoring/journeyScore.ts).
  const publishedIds = selected.filter((journey) => journey.status === "PUBLISHED").map((journey) => journey.id);
  await ensureFreshJourneyScores(publishedIds);
  const freshScores = publishedIds.length > 0
    ? await prisma.journey.findMany({ where: { id: { in: publishedIds } }, select: { id: true, journeyScore: true } })
    : [];
  const scoreById = new Map(freshScores.map((journey) => [journey.id, journey.journeyScore]));

  const items = selected.map((journey) => ({
    id: journey.id,
    title: journey.title,
    coverUrl: journey.coverUrl,
    category: journey.category,
    journeyScore: scoreById.get(journey.id),
    creator: { displayName: journey.creator.displayName, avatarUrl: journey.creator.user.avatarUrl },
  }));
  return withResolvedJourneyCardUrls(items);
}
