import { prisma } from "@/lib/prisma";
import { getImagePlaybackUrl, getVideoPlaybackUrl } from "@/lib/r2";

export type TimelineEpisode = {
  id: string;
  title: string;
  caption: string | null;
  isSponsored: boolean;
  occurredAt: Date;
  videoKey: string | null;
  videoSrc?: string;
  /** Link temporaneo della copertina propria dell'Episodio, se impostata (altrimenti null: chi
   * mostra la miniatura usa la copertina del Journey come riserva). */
  posterUrl: string | null;
  /** Posizione 1-based nell'intero Journey (loose episodes + tutti i Capitoli insieme). */
  number: number;
  durationSec: number | null;
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

type EpisodeRow = {
  id: string;
  title: string;
  caption: string | null;
  isSponsored: boolean;
  occurredAt: Date;
  videoKey: string | null;
  posterKey: string | null;
  createdAt: Date;
  durationSec: number | null;
};

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
  // Solo episodi pubblicati: questa timeline alimenta esclusivamente pagine pubbliche (Pagina
  // Journey e player episodio), mai la Dashboard del creator (che interroga Prisma direttamente
  // per vedere anche le Bozze).
  const [looseEpisodes, chapters] = await Promise.all([
    prisma.episode.findMany({
      where: { journeyId, chapterId: null, deletedAt: null, publishedAt: { not: null } },
      orderBy: { order: "asc" },
    }),
    prisma.chapter.findMany({
      where: { journeyId, deletedAt: null },
      orderBy: { order: "asc" },
      include: {
        episodes: { where: { deletedAt: null, publishedAt: { not: null } }, orderBy: { order: "asc" } },
      },
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
        isSponsored: episode.isSponsored,
        occurredAt: episode.occurredAt,
        videoKey: episode.videoKey,
        posterUrl: null,
        number: counter,
        durationSec: episode.durationSec,
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

  // Copertine proprie degli Episodi (miniature liste/"Up next"): risolte sempre, costo trascurabile
  // rispetto al video e servono anche quando withPlaybackUrls è false.
  const posterKeyByEpisodeId = new Map(
    rawGroups.flatMap((group) => group.episodes.map((episode) => [episode.id, episode.posterKey] as const))
  );
  await Promise.all(
    flatEpisodes
      .filter((episode) => posterKeyByEpisodeId.get(episode.id))
      .map(async (episode) => {
        episode.posterUrl = await getImagePlaybackUrl(posterKeyByEpisodeId.get(episode.id)!);
      })
  );

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
