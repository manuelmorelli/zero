/**
 * Confronto tra due "firme numeriche" di significato (embedding, lib/ai/gemini.ts): torna un
 * numero tra -1 e 1, più alto quanto più i due testi parlano della stessa cosa, indipendentemente
 * dalle parole esatte usate. Usato dalla ricerca sulla Mappa dei Momenti (lib/ai/episodeMoments.ts),
 * non ancora da nessun'altra parte del progetto.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
