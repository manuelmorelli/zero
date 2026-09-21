import { IMAGE_COMPRESSION_QUALITY, MAX_IMAGE_DIMENSION_PX } from "@/lib/constants/image";

export type PixelCrop = { x: number; y: number; width: number; height: number };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = src;
  });
}

/** Ritaglia l'immagine secondo l'area scelta nel riquadro di crop/zoom, restituendo un JPEG. */
export async function getCroppedImageBlob(imageSrc: string, crop: PixelCrop): Promise<Blob> {
  const image = await loadImage(imageSrc);

  // Il ritaglio scelto dall'utente può comunque restare enorme (es. l'intera foto di una fotocamera
  // moderna): limitiamo il lato più lungo dell'output, oltre non serve, le foto non vengono mai
  // mostrate a piena risoluzione originale.
  const scale = Math.min(1, MAX_IMAGE_DIMENSION_PX / Math.max(crop.width, crop.height));
  const outputWidth = Math.round(crop.width * scale);
  const outputHeight = Math.round(crop.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outputWidth, outputHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process image."))),
      "image/jpeg",
      IMAGE_COMPRESSION_QUALITY
    );
  });
}
