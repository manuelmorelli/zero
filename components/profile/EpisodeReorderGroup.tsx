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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { moveEpisodeToIndex } from "@/lib/actions/episode";

type ReorderEpisode = { id: string; title: string; number: number };

type EpisodeReorderGroupProps = {
  /** Id univoco per il DndContext: vedi la nota su @dnd-kit in 99_Current_Project_Status.md
   * (un id fisso evita un mismatch di hydration React su pagine server-renderizzate). */
  dndId: string;
  episodes: ReorderEpisode[];
};

/** Riga trascinabile solo per riordinare: niente modifica/eliminazione qui, quelle restano
 * nella Dashboard (vedi components/creator/EpisodeItem.tsx). */
export function EpisodeReorderGroup({ dndId, episodes }: EpisodeReorderGroupProps) {
  const [items, setItems] = useState(episodes);
  const [, startTransition] = useTransition();

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

  return (
    <DndContext id={dndId} sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((episode) => (
            <EpisodeReorderRow key={episode.id} episode={episode} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function EpisodeReorderRow({ episode }: { episode: ReorderEpisode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: episode.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-ink-muted ${
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
        ⠿
      </button>
      <span className="text-xs font-semibold text-ink-faint">Ep. {episode.number}</span>
      <span className="truncate text-sm font-medium text-ink">{episode.title}</span>
    </div>
  );
}
