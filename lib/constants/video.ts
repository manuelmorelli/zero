// Concordato con l'utente: adatto a un episodio-video di alcuni minuti in buona qualità.
export const MAX_VIDEO_SIZE_BYTES = 1024 * 1024 * 1024;

// Limite separato per i video degli Update: contenuto che sparisce dopo 24h, non ha senso
// applicargli lo stesso limite pensato per un episodio permanente (concordato con Manuel).
export const MAX_UPDATE_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;
export const MAX_UPDATE_VIDEO_DURATION_SEC = 60;

// Tetto massimo di durata per un episodio (concordato con Manuel, 2026-10-09).
export const MAX_EPISODE_DURATION_SEC = 10 * 60;

export const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
  "video/mpeg": "mpeg",
  "video/ogg": "ogv",
};

export const ALLOWED_VIDEO_TYPES = new Set(Object.keys(VIDEO_EXTENSIONS));
