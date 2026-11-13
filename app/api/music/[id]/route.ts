import { prisma } from "@/lib/prisma";
import { getAudioBytes } from "@/lib/r2";

/** Serve un brano della Libreria musicale dalla stessa origine del sito: il player lo scarica e lo
 * mixa con il video (components/journey/EpisodeMusic.tsx), cosa che un indirizzo firmato di R2
 * non permetterebbe senza impostazioni CORS dedicate. I brani sono musica con licenza libera,
 * quindi la risposta è pubblica e può stare in cache a lungo. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await prisma.musicTrack.findFirst({
    where: { id, active: true },
    select: { audioKey: true },
  });
  if (!track) return new Response("Not found", { status: 404 });

  const audio = await getAudioBytes(track.audioKey);
  if (!audio) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(audio.data), {
    headers: {
      "Content-Type": audio.contentType,
      "Content-Length": String(audio.data.length),
      "Cache-Control": "public, max-age=86400",
    },
  });
}
