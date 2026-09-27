import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { generateGeminiImage } from "@/lib/ai/gemini";
import { getImageBytes, putImage } from "@/lib/r2";
import { IMAGE_EXTENSIONS } from "@/lib/constants/image";
import { PDF_CONTENT_TYPE } from "@/lib/constants/communityAiAttachment";

/**
 * Immagini create dall'AI nella chat Community (Punto 8). A differenza della chat (gratuita),
 * ogni immagine costa circa 3 centesimi: per questo è spenta finché Manuel non attiva la
 * fatturazione su Google (GEMINI_IMAGE_GENERATION_ENABLED=true) e ha un tetto giornaliero per
 * creator (deciso con Manuel il 2026-09-27: 5 al giorno, massimo ~15 centesimi a testa).
 */
export const DAILY_AI_IMAGE_LIMIT = 5;

const AI_IMAGE_PREFIX = "ai-images";
const DAY_MS = 24 * 60 * 60 * 1000;

export function isAiImageGenerationEnabled(): boolean {
  return process.env.GEMINI_IMAGE_GENERATION_ENABLED === "true";
}

/** Le immagini AI di un utente stanno sotto "ai-images/{userId}/" (anche gli allegati del "+",
 * sotto ".../uploads/"): basta il prefisso per sapere se una chiave arrivata dal browser gli
 * appartiene davvero. */
export function isOwnAiImageKey(userId: string, key: string): boolean {
  return key.startsWith(`${AI_IMAGE_PREFIX}/${userId}/`) && !key.includes("..");
}

/** Chiave R2 per un allegato del "+" (foto o PDF) caricato dal browser. */
export function newAiUploadKey(userId: string, contentType: string): string {
  const extension = contentType === PDF_CONTENT_TYPE ? "pdf" : IMAGE_EXTENSIONS[contentType];
  return `${AI_IMAGE_PREFIX}/${userId}/uploads/${randomUUID()}.${extension}`;
}

export type CommunityImageResult =
  | { key: string }
  | { unavailable: "disabled" | "limit" | "failed" };

export async function createCommunityImage(params: {
  userId: string;
  prompt: string;
  /** Immagine precedente da modificare (es. "aggiungi il titolo"), già verificata come dell'utente. */
  sourceKey: string | null;
}): Promise<CommunityImageResult> {
  if (!isAiImageGenerationEnabled()) return { unavailable: "disabled" };

  // Ultime 24 ore invece del giorno di calendario: nessun problema di fuso orario e nessun
  // "reset a mezzanotte" da sfruttare.
  const usedToday = await prisma.aiImageGeneration.count({
    where: { userId: params.userId, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
  });
  if (usedToday >= DAILY_AI_IMAGE_LIMIT) return { unavailable: "limit" };

  const source = params.sourceKey ? await getImageBytes(params.sourceKey) : null;
  const image = await generateGeminiImage({
    prompt: params.prompt,
    sourceImage: source ? { data: source.data.toString("base64"), mimeType: source.contentType } : undefined,
  });
  if ("error" in image) return { unavailable: "failed" };

  const key = `${AI_IMAGE_PREFIX}/${params.userId}/${randomUUID()}.jpg`;
  await putImage(key, Buffer.from(image.data, "base64"), image.mimeType);
  await prisma.aiImageGeneration.create({ data: { userId: params.userId, r2Key: key } });
  return { key };
}
