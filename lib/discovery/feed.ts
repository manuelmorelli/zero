import { prisma } from "@/lib/prisma";
import { getFollowedCreatorIds } from "@/lib/discovery/follows";

export type FeedItem =
  | {
      type: "journey";
      date: Date;
      journeyId: string;
      title: string;
      coverUrl: string | null;
      creatorName: string;
    }
  | {
      type: "episode";
      date: Date;
      journeyId: string;
      journeyTitle: string;
      episodeId: string;
      episodeTitle: string;
      coverUrl: string | null;
      creatorName: string;
    };

type GetFollowedCreatorsFeedParams = {
  /** null se l'utente non è loggato: il Feed non esiste senza un account (nessun follow possibile). */
  userId: string | null;
  /** Journey da non riproporre perché già mostrati altrove nella Home (es. Continue Your Journey). */
  excludeJourneyIds?: string[];
  limit?: number;
};

/**
 * Feed dei creator seguiti: nuovi Journey pubblicati e nuovi Episodi aggiunti dai creator
 * che l'utente segue. Usa esclusivamente `publishedAt` (mai `updatedAt`), coerente con la
 * regola in `00-project-context.md` ("Data di pubblicazione del Journey").
 *
 * Un episodio genera un evento "nuovo episodio" solo se aggiunto DOPO che il Journey era già
 * pubblicato: gli episodi creati mentre il Journey era ancora in Bozza diventano visibili tutti
 * insieme nel momento della pubblicazione, già rappresentato dall'evento "nuovo Journey" — non
 * ha senso duplicarlo con un evento per ciascuno dei suoi episodi iniziali.
 *
 * Query: 1 per i creator seguiti + 1 per i Journey nuovi + 1 per gli Episodi nuovi (con i loro
 * Journey/Creator inclusi via join di Prisma) = 3 query totali, nessuna eseguita in un ciclo.
 *
 * Punto di estensione futuro: la selezione dei candidati (`findNewJourneys`/`findNewEpisodes`)
 * e il ranking (`rankByDate`) sono separati apposta. Quando arriveranno Trust Score, un algoritmo
 * di ranking più evoluto o le notifiche, basterà sostituire `rankByDate` (o aggiungere segnali
 * alle query dei candidati) senza toccare la Home, che si limita a passare userId + Journey da
 * escludere e a renderizzare il risultato — stesso pattern già usato da `recommendedJourneys.ts`.
 */
export async function getFollowedCreatorsFeed({
  userId,
  excludeJourneyIds = [],
  limit = 10,
}: GetFollowedCreatorsFeedParams): Promise<FeedItem[]> {
  if (!userId) return [];

  const followedCreatorIds = await getFollowedCreatorIds(userId);
  if (followedCreatorIds.length === 0) return [];

  const [newJourneys, newEpisodes] = await Promise.all([
    findNewJourneys(followedCreatorIds, excludeJourneyIds, limit),
    findNewEpisodes(followedCreatorIds, excludeJourneyIds, limit),
  ]);

  const items: FeedItem[] = [
    ...newJourneys.map(toJourneyFeedItem),
    ...newEpisodes
      .filter((episode) => episode.createdAt > episode.chapter.journey.publishedAt!)
      .map(toEpisodeFeedItem),
  ];

  return rankByDate(items).slice(0, limit);
}

function findNewJourneys(creatorIds: string[], excludeJourneyIds: string[], limit: number) {
  return prisma.journey.findMany({
    where: {
      creatorId: { in: creatorIds },
      status: "PUBLISHED",
      deletedAt: null,
      publishedAt: { not: null },
      id: { notIn: excludeJourneyIds },
    },
    include: { creator: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

// Presa più ampia del `limit` finale: alcuni candidati vengono scartati dopo (episodi della
// prima infornata, già coperti dall'evento "nuovo Journey"), questo margine evita di perdere
// episodi realmente nuovi solo perché la pagina di risultati era troppo stretta.
function findNewEpisodes(creatorIds: string[], excludeJourneyIds: string[], limit: number) {
  return prisma.episode.findMany({
    where: {
      deletedAt: null,
      chapter: {
        deletedAt: null,
        journey: {
          creatorId: { in: creatorIds },
          status: "PUBLISHED",
          deletedAt: null,
          publishedAt: { not: null },
          id: { notIn: excludeJourneyIds },
        },
      },
    },
    include: { chapter: { include: { journey: { include: { creator: true } } } } },
    orderBy: { createdAt: "desc" },
    take: Math.max(limit * 4, 20),
  });
}

type NewJourney = Awaited<ReturnType<typeof findNewJourneys>>[number];
type NewEpisode = Awaited<ReturnType<typeof findNewEpisodes>>[number];

function toJourneyFeedItem(journey: NewJourney): FeedItem {
  return {
    type: "journey",
    date: journey.publishedAt!,
    journeyId: journey.id,
    title: journey.title,
    coverUrl: journey.coverUrl,
    creatorName: journey.creator.displayName,
  };
}

function toEpisodeFeedItem(episode: NewEpisode): FeedItem {
  const journey = episode.chapter.journey;
  return {
    type: "episode",
    date: episode.createdAt,
    journeyId: journey.id,
    journeyTitle: journey.title,
    episodeId: episode.id,
    episodeTitle: episode.title,
    coverUrl: journey.coverUrl,
    creatorName: journey.creator.displayName,
  };
}

function rankByDate(items: FeedItem[]): FeedItem[] {
  return [...items].sort((a, b) => b.date.getTime() - a.date.getTime());
}
