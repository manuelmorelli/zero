"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
import { moveChapterToIndex } from "@/lib/actions/chapter";

type ChapterListItem = {
  id: string;
  title: string;
  description: string | null;
  episodeCount: number;
};

export function ChapterList({
  journeyId,
  chapters,
}: {
  journeyId: string;
  chapters: ChapterListItem[];
}) {
  const [items, setItems] = useState(chapters);
  const [prevChapters, setPrevChapters] = useState(chapters);
  const [, startTransition] = useTransition();

  if (chapters !== prevChapters) {
    setPrevChapters(chapters);
    setItems(chapters);
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
      moveChapterToIndex(String(active.id), newIndex);
    });
  }

  return (
    <DndContext id="chapter-list" sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="mt-4 space-y-3">
          {items.length === 0 && (
            <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
              You haven&apos;t added any chapters yet.
            </p>
          )}
          {items.map((chapter) => (
            <ChapterRow key={chapter.id} journeyId={journeyId} chapter={chapter} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function ChapterRow({ journeyId, chapter }: { journeyId: string; chapter: ChapterListItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-ink-muted ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder chapter"
        className="shrink-0 cursor-grab touch-none px-1 text-ink-muted hover:text-ink active:cursor-grabbing"
      >
        ⠿
      </button>
      <Link href={`/dashboard/journeys/${journeyId}/chapters/${chapter.id}`} className="min-w-0 flex-1">
        <span className="text-sm font-semibold text-ink">{chapter.title}</span>
        {chapter.description && <p className="mt-1 text-sm text-ink-muted">{chapter.description}</p>}
      </Link>
      <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-semibold text-ink-muted">
        {chapter.episodeCount} {chapter.episodeCount === 1 ? "episode" : "episodes"}
      </span>
    </div>
  );
}
