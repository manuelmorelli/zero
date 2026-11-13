import { prisma } from "@/lib/prisma";
import { MUSIC_DEFAULT_VOLUME } from "@/lib/music/constants";

export type EpisodeMusicFields = {
  musicTrackId: string | null;
  musicVolume: number;
  musicFade: boolean;
};

/** Legge i tre campi nascosti del MusicPicker da un form. Un brano inesistente o disattivato
 * viene scartato in silenzio (l'episodio resta senza musica), il volume resta tra 0 e 100. */
export async function readMusicFields(formData: FormData): Promise<EpisodeMusicFields> {
  const rawTrackId = formData.get("musicTrackId");
  const rawVolume = Number(formData.get("musicVolume"));
  const musicVolume = Number.isFinite(rawVolume)
    ? Math.min(100, Math.max(0, Math.round(rawVolume)))
    : MUSIC_DEFAULT_VOLUME;
  const musicFade = formData.get("musicFade") !== "0";

  if (typeof rawTrackId !== "string" || !rawTrackId) {
    return { musicTrackId: null, musicVolume, musicFade };
  }
  const track = await prisma.musicTrack.findFirst({
    where: { id: rawTrackId, active: true },
    select: { id: true },
  });
  return { musicTrackId: track?.id ?? null, musicVolume, musicFade };
}
