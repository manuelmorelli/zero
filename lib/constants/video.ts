// Concordato con l'utente: adatto a un episodio-video di alcuni minuti in buona qualità.
export const MAX_VIDEO_SIZE_BYTES = 1024 * 1024 * 1024;

export const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
  "video/mpeg": "mpeg",
  "video/ogg": "ogv",
};

export const ALLOWED_VIDEO_TYPES = new Set(Object.keys(VIDEO_EXTENSIONS));
