// Formati ammessi per il file di un Prodotto Digitale (lib/actions/communityListing.ts). Diverso
// da lib/constants/image.ts / video.ts: qui il file non viene mai mostrato dentro il sito, solo
// scaricato da chi lo compra, quindi non serve un'estensione per costruire una chiave "leggibile" —
// basta bloccare i formati pericolosi e tenere un limite di dimensione ragionevole.
export const DIGITAL_PRODUCT_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/epub+zip": "epub",
};

export const ALLOWED_DIGITAL_PRODUCT_TYPES = new Set(Object.keys(DIGITAL_PRODUCT_EXTENSIONS));

export const MAX_DIGITAL_PRODUCT_SIZE_BYTES = 50 * 1024 * 1024;
