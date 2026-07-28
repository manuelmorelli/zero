"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteEpisode } from "@/lib/actions/episode";
import { EpisodeForm } from "@/components/creator/EpisodeForm";

type EpisodeItemProps = {
  chapterId: string;
  episode: {
    id: string;
    title: string;
    caption: string | null;
    videoKey: string | null;
    occurredAt: Date;
  };
};

export function EpisodeItem({ chapterId, episode }: EpisodeItemProps) {
  const [editing, setEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: episode.id,
  });
  const rootStyle = { transform: CSS.Transform.toString(transform), transition };
  const rootClassName = `rounded-xl border border-border bg-surface p-5 ${isDragging ? "opacity-50" : ""}`;

  if (editing) {
    return (
      <div ref={setNodeRef} style={rootStyle} className={rootClassName}>
        <EpisodeForm chapterId={chapterId} episode={episode} />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="mt-3 text-xs font-medium text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={rootStyle} className={rootClassName}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder episode"
            className="shrink-0 cursor-grab touch-none px-1 text-ink-muted hover:text-ink active:cursor-grabbing"
          >
            ⠿
          </button>
          <div>
            <p className="text-xs text-ink-faint">
              {episode.occurredAt.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-ink">{episode.title}</h3>
          </div>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-ink-muted hover:text-ink"
          >
            Edit
          </button>
          <form action={deleteEpisode}>
            <input type="hidden" name="episodeId" value={episode.id} />
            <button type="submit" className="text-xs font-medium text-danger hover:opacity-80">
              Delete
            </button>
          </form>
        </div>
      </div>

      {episode.caption && <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{episode.caption}</p>}
      {episode.videoKey && <p className="mt-3 text-sm text-ink-muted">🎬 Video attached</p>}
    </div>
  );
}
