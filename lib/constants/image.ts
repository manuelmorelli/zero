// Limite assoluto: oltre non si prova nemmeno a comprimere, si rifiuta subito (file anomali/corrotti).
// Più permissivo di prima (era 8MB) perché ora la compressione gestisce i file pesanti da sola.
export const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;

// Sopra questa dimensione, la foto viene ridimensionata e ricompressa nel browser prima dell'upload.
export const IMAGE_COMPRESSION_THRESHOLD_BYTES = 2 * 1024 * 1024;

// Lato più lungo massimo dopo la compressione: le foto su Zero non vengono mai mostrate a piena
// risoluzione originale (avatar, copertine, poster), quindi non serve conservare di più.
export const MAX_IMAGE_DIMENSION_PX = 2000;

// Alta di proposito: next/image ricomprime di nuovo in visualizzazione (COVER_IMAGE_QUALITY), quindi
// la copia salvata deve restare quasi senza perdite per non sommare due compressioni pesanti.
export const IMAGE_COMPRESSION_QUALITY = 0.92;

// Qualità con cui next/image serve le copertine (deve essere elencata in next.config.ts > qualities).
export const COVER_IMAGE_QUALITY = 85;

export const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const ALLOWED_IMAGE_TYPES = new Set(Object.keys(IMAGE_EXTENSIONS));
