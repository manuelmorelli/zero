"use server";

import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";

export type MusicTrackItem = {
  id: string;
  title: string;
  artist: string;
  mood: string;
  durationSec: number;
};

/** Elenco della Libreria Zero per il selettore musica. Solo per creator: gli ascolti passano da
 * /api/music/[id], quindi qui non serve nessun indirizzo del file. */
export async function listMusicTracks(): Promise<MusicTrackItem[]> {
  await requireCreator();
  return prisma.musicTrack.findMany({
    where: { active: true },
    orderBy: [{ mood: "asc" }, { title: "asc" }],
    select: { id: true, title: true, artist: true, mood: true, durationSec: true },
  });
}
