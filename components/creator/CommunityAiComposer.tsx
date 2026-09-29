"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, Mic, Square } from "lucide-react";
import type { PendingAttachment } from "@/hooks/useCommunityAiAttachments";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import { CommunityAiAttachmentPreview } from "@/components/creator/CommunityAiAttachmentPreview";
import { CommunityAiAttachMenu } from "@/components/creator/CommunityAiAttachMenu";

const MAX_MESSAGE_LENGTH = 2000;
// Solo con mouse/trackpad: sul telefono mettere il cursore da solo aprirebbe la tastiera.
const FINE_POINTER_QUERY = "(pointer: fine)";

/** La barra di scrittura della chat AI, a pillola come quella di Gemini: "+" a sinistra, testo al
 * centro (va a capo e cresce solo se il messaggio è lungo), a destra il microfono finché non c'è
 * niente da mandare, poi la freccia di invio (come Gemini). Invio manda il
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
  const dictation = useSpeechDictation(value, onChange);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cursore già nella barra all'apertura, e di nuovo quando la barra passa dal centro al fondo
  // dello schermo dopo il primo messaggio (lì è una barra nuova per il browser).
  useEffect(() => {
    if (window.matchMedia(FINE_POINTER_QUERY).matches) textareaRef.current?.focus();
  }, []);

  function send() {
    dictation.cancel();
    onSend();
    // Dopo l'invio il cursore torna nella barra, anche se si era cliccata la freccia.
    textareaRef.current?.focus();
  }

  const showMic = dictation.supported && !dictation.listening && !canSend;
  const error = attachmentError ?? dictation.error;

  return (
    // Bordo e alone arancioni identici a ButtonSecondary ("Create Your Journey" nella Home), più
    // accesi al passaggio del mouse (come quel bottone) e mentre si scrive.
    <div className="rounded-[2rem] border border-ember/35 bg-surface shadow-[0_0_20px_-10px_rgba(226,145,77,45%)] transition-all duration-300 hover:border-ember/70 hover:shadow-[0_0_28px_-8px_rgba(226,145,77,70%)] focus-within:border-ember/70 focus-within:shadow-[0_0_28px_-8px_rgba(226,145,77,70%)]">
      <CommunityAiAttachmentPreview attachments={attachments} onRemove={onRemoveAttachment} />
      {error && <p className="px-5 pt-2 text-xs text-danger">{error}</p>}
      <div className="flex items-end gap-1 p-2">
        <CommunityAiAttachMenu onFiles={onFiles} />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          onPaste={(event) => {
            if (event.clipboardData.files.length === 0) return;
            event.preventDefault();
            onFiles(event.clipboardData.files);
          }}
          rows={1}
          placeholder={dictation.listening ? "Listening…" : "Ask the AI"}
          maxLength={MAX_MESSAGE_LENGTH}
          className="max-h-48 min-h-10 flex-1 resize-none self-center bg-transparent px-2 py-2 text-base leading-relaxed text-ink outline-none [field-sizing:content] placeholder:text-ink-faint"
        />
        {dictation.listening ? (
          <button
            type="button"
            onClick={dictation.stop}
            aria-label="Stop dictation"
            className="flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-ember text-white"
          >
            <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          </button>
        ) : showMic ? (
          <button
            type="button"
            onClick={dictation.start}
            aria-label="Dictate with the microphone"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Mic className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            aria-label="Send"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-bg transition-colors hover:bg-ink-muted disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-faint"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
