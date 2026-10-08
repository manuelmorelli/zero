import { prisma } from "@/lib/prisma";
import { LIVE_JOURNEY_STATUSES } from "@/lib/constants/journeyStatus";

/**
 * Clip della Hero (solo da computer, vedi docs/21_Motion_Guidelines.md): 14 secondi ricavati una
 * volta sola da un episodio vero e salvati in public/videos/ (2-3MB invece delle centinaia di MB
 * dell'originale), con un indirizzo fisso che il browser ricorda tra una visita e l'altra. Non sono
 * video di un creator: la regola "nessuna compressione" non le riguarda. Ogni clip resta legata al
 * suo episodio: la card della Hero mostra quello che il creator ha scritto su quel video.
 */
const HERO_VIDEO_CLIPS = [
  {
    episodeId: "c687d519-d2b5-47d1-a478-71119e53718e", // "the valley"
    src: "/videos/hero-valley.mp4",
    poster: "/videos/hero-valley-poster.jpg",
  },
  {
    episodeId: "8424721a-aa57-4d01-9deb-dec6df540b69", // "Swiss Alps"
    src: "/videos/hero-swiss-alps.mp4",
    poster: "/videos/hero-swiss-alps-poster.jpg",
  },
];

export type HeroVideo = {
  src: string;
  poster: string;
  journeyId: string;
  episodeId: string;
  episodeTitle: string;
  caption: string | null;
  category: string | null;
  creatorName: string;
};

/** Solo le clip il cui episodio è ancora pubblicato in un Journey visibile: se il creator lo
 * cancella o lo nasconde, la sua clip sparisce anche dalla Hero. */
export async function getHeroVideos(): Promise<HeroVideo[]> {
  const episodes = await prisma.episode.findMany({
    where: {
      id: { in: HERO_VIDEO_CLIPS.map((clip) => clip.episodeId) },
      deletedAt: null,
      publishedAt: { not: null },
      journey: { status: { in: LIVE_JOURNEY_STATUSES }, deletedAt: null },
    },
    select: {
      id: true,
      title: true,
      caption: true,
      journey: { select: { id: true, category: true, creator: { select: { displayName: true } } } },
    },
  });

  return HERO_VIDEO_CLIPS.flatMap((clip) => {
    const episode = episodes.find((item) => item.id === clip.episodeId);
    if (!episode) return [];
    return [
      {
        src: clip.src,
        poster: clip.poster,
        journeyId: episode.journey.id,
        episodeId: episode.id,
        episodeTitle: episode.title,
        caption: episode.caption,
        category: episode.journey.category,
        creatorName: episode.journey.creator.displayName,
      },
    ];
  });
}
