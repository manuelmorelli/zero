import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/image";

/**
 * Allegati del "+" nella chat AI Community (Punto 8, deciso con Manuel il 2026-09-27): solo foto e
 * PDF, che Gemini legge gratis. Word/Excel/video/audio lasciati fuori di proposito finché i
 * creator non li chiedono. Condiviso tra browser (scelta file) e server (verifica).
 */
export type CommunityAiAttachmentKind = "image" | "pdf";

export type CommunityAiAttachment = { key: string; kind: CommunityAiAttachmentKind; name: string };

export const PDF_CONTENT_TYPE = "application/pdf";

export const MAX_AI_PDF_SIZE_BYTES = 20 * 1024 * 1024;

export const MAX_AI_ATTACHMENTS_PER_MESSAGE = 3;

export function attachmentKindOf(contentType: string): CommunityAiAttachmentKind | null {
  if (ALLOWED_IMAGE_TYPES.has(contentType)) return "image";
  if (contentType === PDF_CONTENT_TYPE) return "pdf";
  return null;
}

export function maxAttachmentSize(kind: CommunityAiAttachmentKind): number {
  return kind === "image" ? MAX_IMAGE_SIZE_BYTES : MAX_AI_PDF_SIZE_BYTES;
}
