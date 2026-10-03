import { prisma } from "@/lib/prisma";
import { getVideoBytes } from "@/lib/r2";
import { callGemini, embedGeminiText, parseGeminiJson, uploadGeminiFile, waitForGeminiFileActive } from "@/lib/ai/gemini";

/**
 * La "Mappa dei Momenti" (brainstorm del 2026-10-01/02, salto tecnologico AI per Zero): l'AI guarda
 * ogni episodio una volta sola e scrive appunti su cosa succede a ogni minuto. Base per ricerca
 * semantica, trailer automatico e un futuro "Percorso su Misura" costruito da momenti veri presi
 * da creator diversi. Spenta di default: nessuna chiamata parte finché MOMENTS_LIBRARY_ENABLED non
 * è "true", stesso schema già usato per la generazione immagini (lib/ai/communityImage.ts).
 */
export function isMomentsLibraryEnabled(): boolean {
  return process.env.MOMENTS_LIBRARY_ENABLED === "true";
}

const MOMENTS_INSTRUCTION = `You watch a video episode from Zero, a platform where people share real personal journeys (career changes, health, business, creative projects). List the distinct moments that matter to someone else going through something similar: turning points, obstacles, decisions, mistakes, results. For each one give the timestamp in whole seconds from the start of the video and a clear one or two sentence description of what happens and why it matters. Skip filler (greetings, silences, small talk). Write the description in the same language the creator speaks in the video.`;

const MOMENTS_SCHEMA = {
  type: "object",
  properties: {
    moments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          timestampSec: { type: "integer" },
          description: { type: "string" },
        },
        required: ["timestampSec", "description"],
      },
    },
  },
  required: ["moments"],
};

type RawMoment = { timestampSec?: number; description?: string };

export type ExtractMomentsResult = { count: number } | { error: string };

/**
 * Pipeline completa per un episodio: carica il video su Gemini, lo fa guardare una volta con la
 * lettura "agentica" (più economica, guarda con attenzione solo le parti che contano), e scrive gli
 * appunti nel database insieme alla loro firma numerica di significato (per la futura ricerca
 * semantica). Si può rilanciare sullo stesso episodio senza creare doppioni: sostituisce i vecchi
 * appunti. Il video originale su R2 viene solo letto, mai modificato né cancellato.
 */
export async function extractEpisodeMoments(episodeId: string): Promise<ExtractMomentsResult> {
  if (!isMomentsLibraryEnabled()) return { error: "The moments library is switched off." };

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode?.videoKey) return { error: "This episode has no video." };

  const video = await getVideoBytes(episode.videoKey);
  if (!video) return { error: "Video not found on storage." };

  const uploaded = await uploadGeminiFile(video.data, video.contentType);
  if ("error" in uploaded) return uploaded;

  const ready = await waitForGeminiFileActive(uploaded.name);
  if (!ready) return { error: "The video took too long to process." };

  const analysis = await callGemini({
    input: [
      { type: "video", uri: uploaded.uri, mime_type: video.contentType, processing: "agentic" },
      { type: "text", text: `Episode title: ${episode.title}` },
    ],
    systemInstruction: MOMENTS_INSTRUCTION,
    responseSchema: MOMENTS_SCHEMA,
  });
  if ("error" in analysis) return analysis;

  const parsed = parseGeminiJson<{ moments?: RawMoment[] }>(analysis.text);
  const moments = (parsed?.moments ?? []).filter(
    (moment): moment is Required<RawMoment> =>
      typeof moment.timestampSec === "number" && Boolean(moment.description?.trim())
  );
  if (moments.length === 0) return { error: "The AI didn't find any usable moment." };

  const rows: { timestampSec: number; description: string; embedding: number[] }[] = [];
  for (const moment of moments) {
    const embedding = await embedGeminiText(moment.description);
    if (embedding) {
      rows.push({ timestampSec: moment.timestampSec, description: moment.description.trim(), embedding });
    }
  }
  if (rows.length === 0) return { error: "Couldn't create the moments' meaning signature." };

  await prisma.$transaction([
    prisma.episodeMoment.deleteMany({ where: { episodeId } }),
    prisma.episodeMoment.createMany({
      data: rows.map((row) => ({
        episodeId,
        timestampSec: row.timestampSec,
        description: row.description,
        embedding: row.embedding,
      })),
    }),
  ]);

  return { count: rows.length };
}
