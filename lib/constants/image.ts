// Adatto a foto profilo/copertina: qualità alta senza permettere file enormi.
export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

export const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const ALLOWED_IMAGE_TYPES = new Set(Object.keys(IMAGE_EXTENSIONS));
