"use client";

import { useState } from "react";
import { createCommunityAiAttachmentUploadUrl } from "@/lib/actions/communityAi";
import { compressImageIfNeeded } from "@/lib/compressImage";
import { uploadFileWithProgress } from "@/lib/upload";
import {
  attachmentKindOf,
  maxAttachmentSize,
  MAX_AI_ATTACHMENTS_PER_MESSAGE,
  type CommunityAiAttachment,
  type CommunityAiAttachmentKind,
} from "@/lib/constants/communityAiAttachment";

export type PendingAttachment = {
  id: string;
  kind: CommunityAiAttachmentKind;
  name: string;
  /** Anteprima locale della foto (mai per i PDF). */
  previewUrl: string | null;
  /** Presente solo a caricamento finito. */
  key: string | null;
  progress: number;
};

/** Allegati del "+" nella chat AI Community: ogni file parte verso R2 appena scelto (le foto
 * prima compresse, stesso flusso delle copertine), così all'invio del messaggio è già pronto. */
export function useCommunityAiAttachments() {
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  function update(id: string, changes: Partial<PendingAttachment>) {
    setAttachments((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }

  function remove(id: string) {
    setAttachments((current) => current.filter((item) => item.id !== id));
  }

  async function upload(file: File, id: string, kind: CommunityAiAttachmentKind) {
    try {
      const body = kind === "image" ? await compressImageIfNeeded(file) : file;
      const result = await createCommunityAiAttachmentUploadUrl(body.type);
      if ("error" in result) throw new Error(result.error);
      await uploadFileWithProgress(result.uploadUrl, body, (progress) => update(id, { progress }));
      update(id, { key: result.key, progress: 100 });
    } catch {
      remove(id);
      setError(`Couldn't upload ${file.name}. Please try again.`);
    }
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    setError(null);

    const room = MAX_AI_ATTACHMENTS_PER_MESSAGE - attachments.length;
    if (files.length > room) setError(`You can attach up to ${MAX_AI_ATTACHMENTS_PER_MESSAGE} files per message.`);

    Array.from(files)
      .slice(0, Math.max(room, 0))
      .forEach((file) => {
        const kind = attachmentKindOf(file.type);
        if (!kind) {
          setError("Only photos (JPG, PNG, WebP) and PDFs.");
          return;
        }
        if (file.size > maxAttachmentSize(kind)) {
          setError(`${file.name} is too large (max ${Math.round(maxAttachmentSize(kind) / (1024 * 1024))}MB).`);
          return;
        }
        const id = crypto.randomUUID();
        setAttachments((current) => [
          ...current,
          { id, kind, name: file.name, previewUrl: kind === "image" ? URL.createObjectURL(file) : null, key: null, progress: 0 },
        ]);
        upload(file, id, kind);
      });
  }

  const uploading = attachments.some((item) => item.key === null);

  /** Allegati pronti da mandare con il messaggio; svuota la lista. */
  function takeReady(): CommunityAiAttachment[] {
    const ready = attachments
      .filter((item): item is PendingAttachment & { key: string } => item.key !== null)
      .map(({ key, kind, name }) => ({ key, kind, name }));
    setAttachments([]);
    return ready;
  }

  return { attachments, error, uploading, addFiles, remove, takeReady };
}
