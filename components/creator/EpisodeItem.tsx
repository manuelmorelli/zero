"use client";

import { useState } from "react";
import Image from "next/image";
import { GripVertical, Pencil } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteEpisode } from "@/lib/actions/episode";
import { formatDuration } from "@/lib/format/duration";
import { EpisodeForm } from "@/components/creator/EpisodeForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ROW } from "@/components/ui/panel";
import { SponsoredLabel } from "@/components/common/SponsoredLabel";

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
    isSponsored: boolean;
    videoKey: string | null;
    posterUrl?: string | null;
    durationSec: number | null;
    occurredAt: Date;
    chapterId: string | null;
    publishedAt: Date | null;
  };
};

/** Riga trascinabile (riordino reale, vedi moveEpisodeToIndex in lib/actions/episode.ts) che porta
 * anche modifica/eliminazione: un'unica lista, non due liste separate per le stesse righe. La
 * modifica si apre in un popup reale invece che in linea, stessa libreria della Fase 3. */
export function EpisodeItem({ journeyId, chapters, coverUrl, episode }: EpisodeItemProps) {
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: episode.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${ROW} flex items-center gap-3 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${episode.title}`}
        className="shrink-0 cursor-grab touch-none text-ink-muted hover:text-ink active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2">
        {episode.posterUrl || coverUrl ? (
          <Image src={episode.posterUrl || coverUrl!} alt="" fill sizes="56px" draggable={false} className="object-cover" />
        ) : (
          <div className="absolute inset-0 cover-placeholder" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-semibold text-ink">
          <span className="truncate">{episode.title}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-sm font-bold uppercase tracking-wider ${
              episode.publishedAt
                ? "border border-border bg-overlay-soft text-ink-muted"
                : "bg-ember text-bg"
            }`}
          >
            {episode.publishedAt ? "Published" : "Draft"}
          </span>
          {episode.isSponsored && <SponsoredLabel />}
        </p>
        <p className="truncate text-sm text-ink-muted">
          {episode.occurredAt.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
          {episode.durationSec ? ` · ${formatDuration(episode.durationSec)}` : ""}
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

      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="shrink-0 text-sm font-medium text-danger hover:opacity-80"
      >
        Delete
      </button>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Episode</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <EpisodeForm journeyId={journeyId} chapters={chapters} episode={episode} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Episode</DialogTitle>
            <DialogDescription>
              {`"${episode.title}" and its video will be deleted for good. This can't be undone.`}
            </DialogDescription>
          </DialogHeader>
          <form action={deleteEpisode}>
            <input type="hidden" name="episodeId" value={episode.id} />
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Delete
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
