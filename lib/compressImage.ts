import {
  IMAGE_COMPRESSION_QUALITY,
  IMAGE_COMPRESSION_THRESHOLD_BYTES,
  MAX_IMAGE_DIMENSION_PX,
} from "@/lib/constants/image";

/** Se la foto supera la soglia di compressione, la ridisegna più piccola (lato più lungo
 * limitato a MAX_IMAGE_DIMENSION_PX) e la ricomprime come JPEG, tutto nel browser prima
 * dell'upload — nessun costo di calcolo lato server. Sotto la soglia il file torna invariato.
 * `imageOrientation: "from-image"` evita foto da telefono che escono ruotate: il dato EXIF di
 * rotazione va applicato esplicitamente, createImageBitmap non lo fa da solo di default. */
export async function compressImageIfNeeded(file: File): Promise<File> {
  if (file.size <= IMAGE_COMPRESSION_THRESHOLD_BYTES) return file;

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_IMAGE_DIMENSION_PX / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", IMAGE_COMPRESSION_QUALITY)
  );
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}
