const WINDOW_MS = 60 * 60 * 1000;
const MAX_MESSAGES_PER_WINDOW = 30;
// Oltre questa quantità di visitatori tracciati si ripulisce la mappa dagli ormai scaduti, così la
// memoria del processo non cresce senza limite.
const CLEANUP_THRESHOLD = 10_000;

const hits = new Map<string, { count: number; windowStart: number }>();

/**
 * Limite semplice in memoria, per processo server: Ember è raggiungibile anche senza login, quindi
 * senza un freno un uso eccessivo (anche involontario) potrebbe esaurire la quota gratuita di
 * Gemini condivisa con la chat AI della Community. Niente infrastruttura in più (Redis, DB): va
 * bene alla scala attuale del progetto, non ancora online in produzione.
 */
export function isSiteAssistantRateLimited(ip: string): boolean {
  const now = Date.now();

  if (hits.size > CLEANUP_THRESHOLD) {
    for (const [key, value] of hits) {
      if (now - value.windowStart > WINDOW_MS) hits.delete(key);
    }
  }

  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > MAX_MESSAGES_PER_WINDOW;
}
