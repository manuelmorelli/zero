import { randomUUID } from "crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { VIDEO_EXTENSIONS } from "@/lib/constants/video";
import { IMAGE_EXTENSIONS } from "@/lib/constants/image";

const bucket = process.env.R2_BUCKET_NAME!;

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export function newVideoKey(contentType: string, prefix: string = "episodes"): string {
  return `${prefix}/${randomUUID()}.${VIDEO_EXTENSIONS[contentType]}`;
}

/** URL temporaneo (5 minuti) per caricare il file direttamente dal browser a R2. */
export async function getVideoUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(s3, command, { expiresIn: 300 });
}

/** URL temporaneo (1 ora) per la riproduzione, rigenerato a ogni caricamento della pagina. */
export async function getVideoPlaybackUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

/** Dimensione reale del file caricato: la verifica del limite avviene qui, non sull'URL di upload. */
export async function getVideoSize(key: string): Promise<number | null> {
  try {
    const result = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return result.ContentLength ?? null;
  } catch {
    return null;
  }
}

export async function deleteVideo(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })).catch(() => {});
}

/** @param prefix "avatars" o "covers", per tenere separati i due tipi di foto del Profilo. */
export function newImageKey(prefix: string, contentType: string): string {
  return `${prefix}/${randomUUID()}.${IMAGE_EXTENSIONS[contentType]}`;
}

/** URL temporaneo (5 minuti) per caricare l'immagine direttamente dal browser a R2. */
export async function getImageUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(s3, command, { expiresIn: 300 });
}

/** URL temporaneo (1 ora) per la visualizzazione, rigenerato a ogni caricamento della pagina. */
export async function getImagePlaybackUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function deleteImage(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })).catch(() => {});
}

/** Duplica un'immagine già su R2 sotto una nuova chiave, senza farla ripassare dal browser. Usata
 * dal caricamento veloce (vedi quickComposeEpisode in lib/actions/episode.ts) per dare a un
 * Journey appena creato la stessa copertina già scelta per il suo primo episodio — una copia
 * vera e propria, non la stessa chiave condivisa, così cancellare in seguito l'una non spezza
 * l'altra (episodio e Journey hanno cicli di vita indipendenti). */
export async function copyImage(sourceKey: string, destPrefix: string): Promise<string> {
  const extension = sourceKey.split(".").pop();
  const destKey = `${destPrefix}/${randomUUID()}${extension ? `.${extension}` : ""}`;
  await s3.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${sourceKey}`,
      Key: destKey,
    })
  );
  return destKey;
}
