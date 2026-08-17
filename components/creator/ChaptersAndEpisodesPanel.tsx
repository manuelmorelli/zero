"use client";

import { useState, useTransition } from "react";
import { GripVertical } from "lucide-react";
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
import { DashboardPanel } from "@/components/creator/DashboardPanel";
import { EpisodeList } from "@/components/creator/EpisodeList";
import { AddEpisodeButton } from "@/components/creator/AddEpisodeButton";
import { AddChapterButton } from "@/components/creator/AddChapterButton";
import { ChapterEditButton } from "@/components/creator/ChapterEditButton";

type Episode = {
  id: string;
  title: string;
  caption: string | null;
  videoKey: string | null;
  occurredAt: Date;
  chapterId: string | null;
};

type Chapter = {
  id: string;
  title: string;
  description: string | null;
  episodes: Episode[];
};

/** Capitoli ed Episodi in un'unica vista, con trascinamento reale per riordinare sia i Capitoli
 * (questo componente) sia gli Episodi al loro interno (vedi EpisodeList). Non più due pagine
 * separate (Journey + ogni Capitolo): tutto vive nella pagina del Journey. */
export function ChaptersAndEpisodesPanel({
  journeyId,
  chapters,
  looseEpisodes,
  coverUrl,
}: {
  journeyId: string;
  chapters: Chapter[];
  looseEpisodes: Episode[];
  coverUrl: string | null;
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

  const chaptersList = items.map((chapter) => ({ id: chapter.id, title: chapter.title }));
  const hasChapters = items.length > 0;

  return (
    <DashboardPanel
      title={hasChapters ? "Chapters & Episodes" : "Episodes"}
      icon={<GripVertical className="h-4 w-4" aria-hidden="true" />}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <AddEpisodeButton journeyId={journeyId} chapters={chaptersList} />
          <AddChapterButton journeyId={journeyId} label={hasChapters ? "New Chapter" : "Add Chapter"} />
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          {hasChapters && (
            <h3 className="mb-2 text-[0.72rem] uppercase tracking-wider text-ink-muted">No Chapter</h3>
          )}
          <EpisodeList
            dndId={`episodes-${journeyId}-loose`}
            journeyId={journeyId}
            chapters={chaptersList}
            episodes={looseEpisodes}
            coverUrl={coverUrl}
          />
          {hasChapters && (
            <div className="mt-2">
              <AddEpisodeButton journeyId={journeyId} chapters={chaptersList} />
            </div>
          )}
        </div>

        <DndContext id={`chapters-${journeyId}`} sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            {items.map((chapter) => (
              <ChapterBlock
                key={chapter.id}
                journeyId={journeyId}
                chapter={chapter}
                chaptersList={chaptersList}
                coverUrl={coverUrl}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </DashboardPanel>
  );
}

function ChapterBlock({
  journeyId,
  chapter,
  chaptersList,
  coverUrl,
}: {
  journeyId: string;
  chapter: Chapter;
  chaptersList: { id: string; title: string }[];
  coverUrl: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`mt-4 rounded-xl border border-border bg-surface-2 p-3 ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder chapter"
            className="shrink-0 cursor-grab touch-none text-ink-muted hover:text-ink active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
          <h3 className="truncate text-[0.82rem] font-semibold text-ink">{chapter.title}</h3>
        </div>
        <ChapterEditButton
          journeyId={journeyId}
          chapter={{ id: chapter.id, title: chapter.title, description: chapter.description }}
        />
      </div>

      <div className="mt-2.5">
        <EpisodeList
          dndId={`episodes-${journeyId}-${chapter.id}`}
          journeyId={journeyId}
          chapters={chaptersList}
          episodes={chapter.episodes}
          coverUrl={coverUrl}
        />
      </div>
      <div className="mt-2">
        <AddEpisodeButton journeyId={journeyId} chapters={chaptersList} defaultChapterId={chapter.id} />
      </div>
    </div>
  );
}
