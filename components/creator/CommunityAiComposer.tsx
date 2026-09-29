"use client";

import { ArrowUp } from "lucide-react";
import type { PendingAttachment } from "@/hooks/useCommunityAiAttachments";
import { CommunityAiAttachmentPreview } from "@/components/creator/CommunityAiAttachmentPreview";
import { CommunityAiAttachMenu } from "@/components/creator/CommunityAiAttachMenu";

const MAX_MESSAGE_LENGTH = 2000;

/** Il riquadro di scrittura della chat AI, come quello di Gemini: testo che va a capo e cresce
 * mentre si scrive, "+" in basso a sinistra, invio in basso a destra. Invio manda il messaggio,
 * Maiusc+Invio va a capo; un'immagine incollata con Ctrl+V diventa un allegato. */
export function CommunityAiComposer({
  value,
  onChange,
  onSend,
  canSend,
  attachments,
  attachmentError,
  onFiles,
  onRemoveAttachment,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  canSend: boolean;
  attachments: PendingAttachment[];
  attachmentError: string | null;
  onFiles: (files: FileList | null) => void;
  onRemoveAttachment: (id: string) => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-border bg-surface transition-colors focus-within:border-ink-muted">
      <CommunityAiAttachmentPreview attachments={attachments} onRemove={onRemoveAttachment} />
      {attachmentError && <p className="px-4 pt-2 text-xs text-danger">{attachmentError}</p>}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
        onPaste={(event) => {
          if (event.clipboardData.files.length === 0) return;
          event.preventDefault();
          onFiles(event.clipboardData.files);
        }}
        rows={1}
        placeholder="Ask the AI, or describe what you want to create"
        maxLength={MAX_MESSAGE_LENGTH}
        className="block max-h-48 min-h-12 w-full resize-none bg-transparent px-5 pt-3.5 text-sm leading-relaxed text-ink outline-none [field-sizing:content] placeholder:text-ink-faint"
      />
      <div className="flex items-center justify-between px-2.5 pb-2.5">
        <CommunityAiAttachMenu onFiles={onFiles} />
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-bg transition-colors hover:bg-ink-muted disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-faint"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
