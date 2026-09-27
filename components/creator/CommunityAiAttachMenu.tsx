"use client";

import { useRef } from "react";
import { FileText, ImageIcon, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ALLOWED_IMAGE_TYPES } from "@/lib/constants/image";
import { MAX_AI_ATTACHMENTS_PER_MESSAGE, PDF_CONTENT_TYPE } from "@/lib/constants/communityAiAttachment";

const PHOTO_ACCEPT = [...ALLOWED_IMAGE_TYPES].join(",");

/** Il "+" della chat AI Community: come su Gemini apre prima un piccolo menu che spiega cosa si
 * può allegare, e solo dopo la scelta apre la cartella dei file, già filtrata su quel tipo
 * (richiesta di Manuel il 2026-09-27: aprire subito OneDrive non faceva capire niente). */
export function CommunityAiAttachMenu({ onFiles }: { onFiles: (files: FileList | null) => void }) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  function fileInput(ref: React.RefObject<HTMLInputElement | null>, accept: string, multiple: boolean) {
    return (
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
        className="hidden"
      />
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Attach photos or PDFs"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-60">
          <DropdownMenuItem onSelect={() => photoInputRef.current?.click()}>
            <ImageIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            <span className="flex flex-col">
              Photo
              <span className="text-xs text-ink-faint">JPG, PNG or WebP</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => pdfInputRef.current?.click()}>
            <FileText className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            <span className="flex flex-col">
              PDF document
              <span className="text-xs text-ink-faint">A program, a guide, notes…</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <p className="px-2.5 py-1.5 text-xs text-ink-faint">
            Up to {MAX_AI_ATTACHMENTS_PER_MESSAGE} files. The AI reads them to help you.
          </p>
        </DropdownMenuContent>
      </DropdownMenu>
      {fileInput(photoInputRef, PHOTO_ACCEPT, true)}
      {fileInput(pdfInputRef, PDF_CONTENT_TYPE, true)}
    </>
  );
}
