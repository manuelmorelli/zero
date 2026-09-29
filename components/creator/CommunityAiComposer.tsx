"use client";

import { ArrowUp } from "lucide-react";
import type { PendingAttachment } from "@/hooks/useCommunityAiAttachments";
import { CommunityAiAttachmentPreview } from "@/components/creator/CommunityAiAttachmentPreview";
import { CommunityAiAttachMenu } from "@/components/creator/CommunityAiAttachMenu";

const MAX_MESSAGE_LENGTH = 2000;

/** La barra di scrittura della chat AI, a pillola come quella di Gemini: "+" a sinistra, testo al
 * centro (va a capo e cresce solo se il messaggio è lungo), invio a destra. Invio manda il
 * messaggio, Maiusc+Invio va a capo; un'immagine incollata con Ctrl+V diventa un allegato. */
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
    <div className="rounded-[2rem] border border-border bg-surface shadow-2xl shadow-black/40 transition-colors focus-within:border-ink-muted">
      <CommunityAiAttachmentPreview attachments={attachments} onRemove={onRemoveAttachment} />
      {attachmentError && <p className="px-5 pt-2 text-xs text-danger">{attachmentError}</p>}
      <div className="flex items-end gap-1 p-2">
        <CommunityAiAttachMenu onFiles={onFiles} />
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
          placeholder="Ask the AI"
          maxLength={MAX_MESSAGE_LENGTH}
          className="max-h-48 min-h-10 flex-1 resize-none self-center bg-transparent px-2 py-2 text-base leading-relaxed text-ink outline-none [field-sizing:content] placeholder:text-ink-faint"
        />
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
