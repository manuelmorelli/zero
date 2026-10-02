import { prisma } from "@/lib/prisma";
import { resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import { PUBLICLY_REACHABLE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";

export type ForumJourneyItem = {
  id: string;
  title: string;
  coverUrl: string | null;
  messageCount: number;
};

/** I Journey di un creator che hanno un forum raggiungibile: stessi stati della pagina pubblica del
 * Journey (PUBLICLY_REACHABLE_JOURNEY_STATUSES) — se la pagina del Journey esiste, esiste anche il
 * suo forum. Usata dalla sezione Forum della pagina Community per elencarli. */
export async function getForumJourneys(creatorId: string): Promise<ForumJourneyItem[]> {
  const journeys = await prisma.journey.findMany({
    where: { creatorId, status: { in: PUBLICLY_REACHABLE_JOURNEY_STATUSES }, deletedAt: null },
    orderBy: { order: "asc" },
    include: { _count: { select: { forumMessages: { where: { deletedAt: null } } } } },
  });

  return Promise.all(
    journeys.map(async (journey) => ({
      id: journey.id,
      title: journey.title,
      coverUrl: await resolveCoverUrl(journey.coverUrl),
      messageCount: journey._count.forumMessages,
    }))
  );
}
