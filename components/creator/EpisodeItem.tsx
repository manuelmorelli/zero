"use client";

import { useState } from "react";
import Image from "next/image";
import { GripVertical, Pencil } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteEpisode } from "@/lib/actions/episode";
import { EpisodeForm } from "@/components/creator/EpisodeForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type EpisodeItemProps = {
  journeyId: string;
  chapters: { id: string; title: string }[];
  /** Copertina del Journey, usata come miniatura di riserva: gli Episodi non hanno una propria
   * foto (solo un video opzionale), a differenza del mockup Lovable. */
  coverUrl?: string | null;
  episode: {
    id: string;
    title: string;
    caption: string | null;
    videoKey: string | null;
    occurredAt: Date;
    chapterId: string | null;
  };
};

/** Riga trascinabile (riordino reale, vedi moveEpisodeToIndex in lib/actions/episode.ts) che porta
 * anche modifica/eliminazione: un'unica lista, non due liste separate per le stesse righe. La
 * modifica si apre in un popup reale invece che in linea, stessa libreria della Fase 3. */
export function EpisodeItem({ journeyId, chapters, coverUrl, episode }: EpisodeItemProps) {
  const [editing, setEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: episode.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-ink-muted ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder episode"
        className="shrink-0 cursor-grab touch-none text-ink-muted hover:text-ink active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2">
        {coverUrl ? (
          <Image src={coverUrl} alt="" fill sizes="56px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{episode.title}</p>
        <p className="truncate text-xs text-ink-muted">
          {episode.occurredAt.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
          {episode.caption ? ` · ${episode.caption}` : ""}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Edit ${episode.title}`}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-ink-muted transition-colors hover:border-ink-muted hover:text-ember"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <form action={deleteEpisode}>
        <input type="hidden" name="episodeId" value={episode.id} />
        <button type="submit" className="shrink-0 text-xs font-medium text-danger hover:opacity-80">
          Delete
        </button>
      </form>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit episode</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <EpisodeForm journeyId={journeyId} chapters={chapters} episode={episode} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
