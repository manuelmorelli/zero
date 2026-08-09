import { prisma } from "@/lib/prisma";
import { getVideoPlaybackUrl } from "@/lib/r2";

export type TimelineEpisode = {
  id: string;
  title: string;
  caption: string | null;
  occurredAt: Date;
  videoKey: string | null;
  videoSrc?: string;
  /** Posizione 1-based nell'intero Journey (loose episodes + tutti i Capitoli insieme). */
  number: number;
  /** Avanzamento dell'utente corrente su questo episodio; null se non loggato o mai iniziato. */
  progress: { positionSec: number; completedAt: Date | null } | null;
};

export type TimelineGroup = {
  chapterId: string | null;
  chapterTitle: string | null;
  episodes: TimelineEpisode[];
};

export type EpisodeTimeline = {
  groups: TimelineGroup[];
  /** Stessi episodi, in ordine, senza il raggruppamento per Capitolo — utile per "ultimo episodio". */
  flatEpisodes: TimelineEpisode[];
};

type EpisodeRow = { id: string; title: string; caption: string | null; occurredAt: Date; videoKey: string | null; createdAt: Date };

function earliestCreatedAt(episodes: EpisodeRow[]): Date {
  return episodes.reduce((min, episode) => (episode.createdAt < min ? episode.createdAt : min), episodes[0].createdAt);
}

/**
 * Sequenza unica di episodi di un Journey (episodi senza Capitolo + episodi di ogni Capitolo),
 * usata dalla pagina episodi stile Netflix. I gruppi (blocco "senza capitolo" compreso) sono
 * ordinati in base a quando sono stati usati per la prima volta (il più vecchio `createdAt` dei
 * loro episodi), non con il blocco "senza capitolo" sempre fisso in cima come nella vecchia
 * pagina: un nuovo episodio aggiunto senza Capitolo resta quindi nel punto della sequenza in cui
 * quel gruppo si trova davvero, invece di saltare in cima alla pagina.
 */
export async function getEpisodeTimeline(
  journeyId: string,
  { withPlaybackUrls = false, userId }: { withPlaybackUrls?: boolean; userId?: string } = {}
): Promise<EpisodeTimeline> {
  const [looseEpisodes, chapters] = await Promise.all([
    prisma.episode.findMany({
      where: { journeyId, chapterId: null, deletedAt: null },
      orderBy: { order: "asc" },
    }),
    prisma.chapter.findMany({
      where: { journeyId, deletedAt: null },
      orderBy: { order: "asc" },
      include: { episodes: { where: { deletedAt: null }, orderBy: { order: "asc" } } },
    }),
  ]);

  const rawGroups: { chapterId: string | null; chapterTitle: string | null; episodes: EpisodeRow[]; anchor: Date }[] = [];

  if (looseEpisodes.length > 0) {
    rawGroups.push({
      chapterId: null,
      chapterTitle: null,
      episodes: looseEpisodes,
      anchor: earliestCreatedAt(looseEpisodes),
    });
  }
  for (const chapter of chapters) {
    if (chapter.episodes.length === 0) continue;
    rawGroups.push({
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      episodes: chapter.episodes,
      anchor: earliestCreatedAt(chapter.episodes),
    });
  }

  rawGroups.sort((a, b) => a.anchor.getTime() - b.anchor.getTime());

  let counter = 0;
  const groups: TimelineGroup[] = [];
  const flatEpisodes: TimelineEpisode[] = [];

  for (const rawGroup of rawGroups) {
    const episodes: TimelineEpisode[] = rawGroup.episodes.map((episode) => {
      counter += 1;
      const timelineEpisode: TimelineEpisode = {
        id: episode.id,
        title: episode.title,
        caption: episode.caption,
        occurredAt: episode.occurredAt,
        videoKey: episode.videoKey,
        number: counter,
        progress: null,
      };
      flatEpisodes.push(timelineEpisode);
      return timelineEpisode;
    });
    groups.push({ chapterId: rawGroup.chapterId, chapterTitle: rawGroup.chapterTitle, episodes });
  }

  if (withPlaybackUrls) {
    await Promise.all(
      flatEpisodes
        .filter((episode) => episode.videoKey)
        .map(async (episode) => {
          episode.videoSrc = await getVideoPlaybackUrl(episode.videoKey!);
        })
    );
  }

  if (userId && flatEpisodes.length > 0) {
    const progresses = await prisma.episodeProgress.findMany({
      where: { userId, episodeId: { in: flatEpisodes.map((episode) => episode.id) } },
    });
    const progressByEpisodeId = new Map(
      progresses.map((progress) => [progress.episodeId, progress])
    );
    for (const episode of flatEpisodes) {
      const progress = progressByEpisodeId.get(episode.id);
      if (progress) {
        episode.progress = { positionSec: progress.positionSec, completedAt: progress.completedAt };
      }
    }
  }

  return { groups, flatEpisodes };
}
