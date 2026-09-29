/* eslint-disable @next/next/no-img-element -- anteprima locale (blob:) di un file appena scelto, non ottimizzabile */
import { FileText, Loader2, X } from "lucide-react";
import type { PendingAttachment } from "@/hooks/useCommunityAiAttachments";

/** Anteprime sopra il campo di scrittura della chat AI, come su Gemini: miniatura per le foto,
 * icona e nome per i PDF, X per toglierle. */
export function CommunityAiAttachmentPreview({
  attachments,
  onRemove,
}: {
  attachments: PendingAttachment[];
  onRemove: (id: string) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-3 pt-3">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="relative flex h-14 items-center overflow-hidden rounded-xl border border-border bg-surface-2"
        >
          {attachment.previewUrl ? (
            <img src={attachment.previewUrl} alt="" className="h-14 w-14 object-cover" />
          ) : (
            <div className="flex max-w-40 items-center gap-2 px-3">
              <FileText className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <span className="truncate text-sm text-ink">{attachment.name}</span>
            </div>
          )}
          {attachment.key === null && (
            <div className="absolute inset-0 flex items-center justify-center bg-scrim text-sm font-semibold text-on-photo">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(attachment.id)}
            aria-label={`Remove ${attachment.name}`}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-scrim text-on-photo transition-colors hover:bg-bg"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
