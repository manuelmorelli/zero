import { isMomentsLibraryEnabled } from "@/lib/ai/episodeMoments";
import { embedGeminiText, callGemini, parseGeminiJson } from "@/lib/ai/gemini";
import { cosineSimilarity } from "@/lib/ai/embeddingSimilarity";
import {
  MIN_SIMILARITY,
  fetchEligibleMoments,
  pickTopPerEpisode,
  enrichMoments,
  type EpisodeMomentSearchItem,
} from "@/lib/search/searchEpisodeMoments";

// Quanti candidati (al massimo uno per episodio) passare alla seconda chiamata, che poi scarta e
// ordina: abbastanza scelta senza mandare all'AI appunti troppo lontani dalla situazione descritta.
const CANDIDATE_POOL_SIZE = 15;
// Un solo momento non è un percorso; più di qualche episodio diventerebbe lungo da seguire.
const MIN_PATH_LENGTH = 2;
const MAX_PATH_LENGTH = 8;

const ORDER_INSTRUCTION = `Someone describes a personal situation on Zero, a platform where people share real personal journeys. You are given short real notes found by meaning in different video episodes from other creators. Pick only the notes that genuinely fit together as a coherent path for this person (skip ones that don't really fit, even if given to you), and order them so the sequence reads like a journey: first the problem or struggle, then the obstacle or turning point, then the outcome or lesson. Use only the notes given, never invent new ones or change their wording. Return between 2 and 8 ids, in the chosen order.`;

const ORDER_SCHEMA = {
  type: "object",
  properties: {
    sequence: { type: "array", items: { type: "string" } },
  },
  required: ["sequence"],
};

/**
 * Il Percorso su Misura: a partire da una situazione scritta in linguaggio libero, trova i momenti
 * veri più vicini per significato (presi da episodi di creator diversi, stessa ricerca della
 * Mappa dei Momenti usata da searchEpisodeMoments) e chiede a una seconda chiamata, solo testuale
 * e economica, di scegliere e ordinare quali di quei momenti raccontano insieme una storia
 * sensata. L'AI non scrive mai contenuto nuovo qui: sceglie e ordina solo appunti già scritti e
 * salvati. Torna sempre vuoto se MOMENTS_LIBRARY_ENABLED è spento, o se non emerge un percorso
 * coerente di almeno due momenti.
 */
export async function composeCustomPath(situation: string): Promise<EpisodeMomentSearchItem[]> {
  if (!isMomentsLibraryEnabled()) return [];

  const trimmed = situation.trim();
  if (!trimmed) return [];

  const queryEmbedding = await embedGeminiText(trimmed);
  if (!queryEmbedding) return [];

  const moments = await fetchEligibleMoments();
  const scored = moments
    .map((moment) => ({
      moment,
      similarity: cosineSimilarity(queryEmbedding, moment.embedding as number[]),
    }))
    .filter((entry) => entry.similarity >= MIN_SIMILARITY)
    .sort((a, b) => b.similarity - a.similarity);

  const candidates = pickTopPerEpisode(scored, CANDIDATE_POOL_SIZE);
  if (candidates.length < MIN_PATH_LENGTH) return [];

  const orderResult = await callGemini({
    input: `Situation: "${trimmed}"\n\nCandidate notes (JSON array of {id, text}):\n${JSON.stringify(
      candidates.map((moment) => ({ id: moment.id, text: moment.description }))
    )}`,
    systemInstruction: ORDER_INSTRUCTION,
    responseSchema: ORDER_SCHEMA,
  });
  if ("error" in orderResult) return [];

  const parsed = parseGeminiJson<{ sequence?: string[] }>(orderResult.text);
  const byId = new Map(candidates.map((moment) => [moment.id, moment]));
  const seen = new Set<string>();
  const sequence = [];
  for (const id of parsed?.sequence ?? []) {
    const moment = byId.get(id);
    if (!moment || seen.has(id)) continue;
    seen.add(id);
    sequence.push(moment);
    if (sequence.length >= MAX_PATH_LENGTH) break;
  }

  // Meglio nessun percorso che uno senza un vero filo logico: se l'AI ha scartato quasi tutto o
  // non ha risposto in modo utile, non si mostra nulla.
  if (sequence.length < MIN_PATH_LENGTH) return [];

  return enrichMoments(sequence);
}
