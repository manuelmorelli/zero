import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { EpisodeItem } from "@/components/creator/EpisodeItem";

type EpisodeListItem = {
  id: string;
  title: string;
  caption: string | null;
  videoKey: string | null;
  durationSec: number | null;
  occurredAt: Date;
  chapterId: string | null;
  publishedAt: Date | null;
};

/** Lista trascinabile (solo la parte "sortable": il DndContext che la governa vive nel genitore,
 * ChaptersAndEpisodesPanel — un DndContext annidato dentro un altro rompeva il trascinamento degli
 * episodi dentro un Capitolo, per questo qui non ce n'è più uno proprio). */
export function EpisodeList({
  journeyId,
  chapters,
  episodes,
  coverUrl,
}: {
  journeyId: string;
  chapters: { id: string; title: string }[];
  episodes: EpisodeListItem[];
  coverUrl?: string | null;
}) {
  if (episodes.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
        You haven&apos;t added any episodes yet.
      </p>
    );
  }

  return (
    <SortableContext items={episodes.map((episode) => episode.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-2">
        {episodes.map((episode) => (
          <EpisodeItem
            key={episode.id}
            journeyId={journeyId}
            chapters={chapters}
            coverUrl={coverUrl}
            episode={episode}
          />
        ))}
      </div>
    </SortableContext>
  );
}
