"use client";

import { useState } from "react";
import { deleteEpisode } from "@/lib/actions/episode";
import { EpisodeForm } from "@/components/creator/EpisodeForm";

type EpisodeItemProps = {
  journeyId: string;
  chapters: { id: string; title: string }[];
  episode: {
    id: string;
    title: string;
    caption: string | null;
    videoKey: string | null;
    occurredAt: Date;
    chapterId: string | null;
  };
};

export function EpisodeItem({ journeyId, chapters, episode }: EpisodeItemProps) {
  const [editing, setEditing] = useState(false);
  const rootClassName = "rounded-xl border border-border bg-surface p-5";

  if (editing) {
    return (
      <div className={rootClassName}>
        <EpisodeForm journeyId={journeyId} chapters={chapters} episode={episode} />
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
    <div className={rootClassName}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
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
      {episode.videoKey && <p className="mt-3 text-sm text-ink-muted">🎬 Video attached</p>}
    </div>
  );
}
