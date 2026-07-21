"use client";

import { useState } from "react";
import { deleteEpisode } from "@/lib/actions/episode";
import { EpisodeForm } from "@/components/creator/EpisodeForm";

type EpisodeItemProps = {
  chapterId: string;
  episode: {
    id: string;
    title: string;
    caption: string | null;
    videoUrl: string | null;
    occurredAt: Date;
  };
};

export function EpisodeItem({ chapterId, episode }: EpisodeItemProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
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
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-ink-faint">
            {episode.occurredAt.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-ink">{episode.title}</h3>
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
      {episode.videoUrl && (
        <a
          href={episode.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-ink underline underline-offset-2"
        >
          Watch video
        </a>
      )}
    </div>
  );
}
