"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { moveEpisodeToIndex } from "@/lib/actions/episode";
import { EpisodeItem } from "@/components/creator/EpisodeItem";

type EpisodeListItem = {
  id: string;
  title: string;
  caption: string | null;
  videoKey: string | null;
  occurredAt: Date;
  chapterId: string | null;
};

/** Trascinamento per riordinare ed edit/delete nella stessa lista (vedi EpisodeItem): non più due
 * liste separate come in Fase 3 (una sola per riordinare, una sola per modificare). */
export function EpisodeList({
  journeyId,
  chapters,
  episodes,
  coverUrl,
  dndId,
}: {
  journeyId: string;
  chapters: { id: string; title: string }[];
  episodes: EpisodeListItem[];
  coverUrl?: string | null;
  /** Id univoco per il DndContext quando più liste (una per Capitolo) vivono sulla stessa pagina. */
  dndId: string;
}) {
  const [items, setItems] = useState(episodes);
  const [prevEpisodes, setPrevEpisodes] = useState(episodes);
  const [, startTransition] = useTransition();

  if (episodes !== prevEpisodes) {
    setPrevEpisodes(episodes);
    setItems(episodes);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    setItems(arrayMove(items, oldIndex, newIndex));
    startTransition(() => {
      moveEpisodeToIndex(String(active.id), newIndex);
    });
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
        You haven&apos;t added any episodes yet.
      </p>
    );
  }

  return (
    <DndContext id={dndId} sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((episode) => (
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
    </DndContext>
  );
}
