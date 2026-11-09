import { IMAGE_COMPRESSION_QUALITY, MAX_IMAGE_DIMENSION_PX } from "@/lib/constants/image";

export type PixelCrop = { x: number; y: number; width: number; height: number };

/** Disegna la foto intera, sfocata e allargata, a riempimento del canvas: fa da sfondo dietro
 * alla foto quando è rimpicciolita, prendendo il colore dalla foto stessa invece di un grigio fisso. */
function drawBlurredBackground(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  // Scala "cover" più un margine extra: la sfocatura campiona anche fuori dai bordi del canvas,
  // senza il margine si vedrebbe un bordo trasparente/chiaro lungo i lati.
  const oversize = 1.15;
  const coverScale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * oversize;
  const drawWidth = image.naturalWidth * coverScale;
  const drawHeight = image.naturalHeight * coverScale;

  // Una sfocatura troppo forte media tutta la foto in un unico colore quasi grigio: resta più
  // leggera (3.5% del lato) e con più saturazione, così si vedono ancora le macchie di colore.
  ctx.save();
  ctx.filter = `blur(${Math.round(Math.max(width, height) * 0.035)}px) saturate(1.6) brightness(1.05)`;
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  ctx.restore();
}

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

  // Con zoom sotto 1 la foto è più piccola del riquadro di ritaglio: l'area attorno va riempita,
  // altrimenti il JPEG finale (senza trasparenza) la renderebbe nera. Sfondo preso dalla foto
  // stessa (sfocata), non un grigio fisso.
  drawBlurredBackground(ctx, image, outputWidth, outputHeight);
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outputWidth, outputHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process image."))),
      "image/jpeg",
      IMAGE_COMPRESSION_QUALITY
    );
  });
}
