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
import { moveEpisodeToIndex } from "@/lib/actions/episode";
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
  durationSec: number | null;
  occurredAt: Date;
  chapterId: string | null;
  publishedAt: Date | null;
};

type Chapter = {
  id: string;
  title: string;
  description: string | null;
  episodes: Episode[];
};

/** Capitoli ed Episodi in un'unica vista, con un solo DndContext per tutta la pagina (Capitoli e
 * Episodi di ogni Capitolo hanno ciascuno la propria zona di trascinamento — SortableContext — ma
 * tutte vivono sotto lo stesso DndContext: annidarne due, come prima, rompeva il trascinamento
 * degli Episodi dentro un Capitolo). */
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
  const [chapterItems, setChapterItems] = useState(chapters);
  const [looseItems, setLooseItems] = useState(looseEpisodes);
  const [prevProps, setPrevProps] = useState({ chapters, looseEpisodes });
  const [, startTransition] = useTransition();

  if (prevProps.chapters !== chapters || prevProps.looseEpisodes !== looseEpisodes) {
    setPrevProps({ chapters, looseEpisodes });
    setChapterItems(chapters);
    setLooseItems(looseEpisodes);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const chapterIndex = chapterItems.findIndex((chapter) => chapter.id === activeId);
    if (chapterIndex !== -1) {
      const overIndex = chapterItems.findIndex((chapter) => chapter.id === overId);
      if (overIndex === -1) return;
      setChapterItems((prev) => arrayMove(prev, chapterIndex, overIndex));
      startTransition(() => moveChapterToIndex(activeId, overIndex));
      return;
    }

    const looseIndex = looseItems.findIndex((episode) => episode.id === activeId);
    if (looseIndex !== -1) {
      const overIndex = looseItems.findIndex((episode) => episode.id === overId);
      if (overIndex === -1) return;
      setLooseItems((prev) => arrayMove(prev, looseIndex, overIndex));
      startTransition(() => moveEpisodeToIndex(activeId, overIndex));
      return;
    }

    const ownerChapterIndex = chapterItems.findIndex((chapter) =>
      chapter.episodes.some((episode) => episode.id === activeId)
    );
    if (ownerChapterIndex === -1) return;
    const chapter = chapterItems[ownerChapterIndex]!;
    const epIndex = chapter.episodes.findIndex((episode) => episode.id === activeId);
    const overIndex = chapter.episodes.findIndex((episode) => episode.id === overId);
    if (overIndex === -1) return;

    const nextEpisodes = arrayMove(chapter.episodes, epIndex, overIndex);
    setChapterItems((prev) => {
      const next = [...prev];
      next[ownerChapterIndex] = { ...chapter, episodes: nextEpisodes };
      return next;
    });
    startTransition(() => moveEpisodeToIndex(activeId, overIndex));
  }

  const chaptersList = chapterItems.map((chapter) => ({ id: chapter.id, title: chapter.title }));
  const hasChapters = chapterItems.length > 0;

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
      <DndContext id={`journey-${journeyId}`} sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          <div>
            {hasChapters && (
              <h3 className="mb-2 text-[0.72rem] uppercase tracking-wider text-ink-muted">No Chapter</h3>
            )}
            <EpisodeList
              journeyId={journeyId}
              chapters={chaptersList}
              episodes={looseItems}
              coverUrl={coverUrl}
            />
          </div>

          <SortableContext items={chapterItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            {chapterItems.map((chapter) => (
              <ChapterBlock
                key={chapter.id}
                journeyId={journeyId}
                chapter={chapter}
                chaptersList={chaptersList}
                coverUrl={coverUrl}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
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
          journeyId={journeyId}
          chapters={chaptersList}
          episodes={chapter.episodes}
          coverUrl={coverUrl}
        />
      </div>
    </div>
  );
}
