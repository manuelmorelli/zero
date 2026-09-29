"use client";

import { useState, useTransition } from "react";
import { GripVertical } from "lucide-react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type DragOverEvent,
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
import { NameLooseEpisodesButton } from "@/components/creator/NameLooseEpisodesButton";
import { CardTitle } from "@/components/ui/heading";

type Episode = {
  id: string;
  title: string;
  caption: string | null;
  videoKey: string | null;
  posterUrl?: string | null;
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

// Id delle zone di rilascio degli Episodi: distinti dagli id dei Capitoli stessi (già usati come
// id trascinabile per riordinare i Capitoli) e dagli id degli Episodi, così dnd-kit non li confonde
// nello stesso DndContext.
const LOOSE_CONTAINER_ID = "loose-episodes";
const CHAPTER_CONTAINER_PREFIX = "chapter-episodes:";
function chapterContainerId(chapterId: string): string {
  return `${CHAPTER_CONTAINER_PREFIX}${chapterId}`;
}
function chapterIdFromContainer(containerId: string): string | null {
  return containerId === LOOSE_CONTAINER_ID ? null : containerId.slice(CHAPTER_CONTAINER_PREFIX.length);
}

// Anteprima del rilascio tra un gruppo e l'altro: dove finirebbe l'Episodio trascinato SE lo
// rilasciassi ora. Puramente visiva — vedi il commento su handleDragOver più sotto sul perché non
// si sposta davvero l'Episodio nello stato finché non viene rilasciato.
type DragPreview = { activeId: string; toContainerId: string; toIndex: number };

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
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [, startTransition] = useTransition();

  // Un trascinamento in corso non deve mai essere interrotto da un ricaricamento dei dati in
  // arrivo dal server (es. la revalidazione partita da un'azione precedente, come un altro
  // riordino appena salvato): dnd-kit annulla il trascinamento attivo se i dati sottostanti
  // cambiano a metà. Il riallineamento viene solo rimandato a dopo, non perso — appena il
  // trascinamento finisce, il prossimo render lo applica normalmente.
  const [isDragging, setIsDragging] = useState(false);

  if (!isDragging && (prevProps.chapters !== chapters || prevProps.looseEpisodes !== looseEpisodes)) {
    setPrevProps({ chapters, looseEpisodes });
    setChapterItems(chapters);
    setLooseItems(looseEpisodes);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Lista episodi di una zona (un Capitolo, o "No Chapter") e relativo setter — permettono di
  // trattare tutte le zone allo stesso modo senza ripetere la distinzione loose/Capitolo ad ogni passo.
  function getContainerEpisodes(containerId: string): Episode[] {
    if (containerId === LOOSE_CONTAINER_ID) return looseItems;
    return chapterItems.find((chapter) => chapterContainerId(chapter.id) === containerId)?.episodes ?? [];
  }

  function setContainerEpisodes(containerId: string, episodes: Episode[]) {
    if (containerId === LOOSE_CONTAINER_ID) {
      setLooseItems(episodes);
      return;
    }
    setChapterItems((prev) =>
      prev.map((chapter) => (chapterContainerId(chapter.id) === containerId ? { ...chapter, episodes } : chapter))
    );
  }

  // In quale zona si trova oggi un dato episodio.
  function containerIdOfEpisode(episodeId: string): string | null {
    if (looseItems.some((episode) => episode.id === episodeId)) return LOOSE_CONTAINER_ID;
    const chapter = chapterItems.find((chapter) => chapter.episodes.some((episode) => episode.id === episodeId));
    return chapter ? chapterContainerId(chapter.id) : null;
  }

  // A quale zona corrisponde l'elemento su cui si sta trascinando: la zona stessa (anche vuota),
  // l'intestazione di un Capitolo (rilascio "generico" su quel Capitolo), o un altro Episodio (la
  // zona a cui appartiene).
  function resolveOverContainerId(overId: string): string | null {
    if (overId === LOOSE_CONTAINER_ID) return LOOSE_CONTAINER_ID;
    if (chapterItems.some((chapter) => chapterContainerId(chapter.id) === overId)) return overId;
    const chapterHeader = chapterItems.find((chapter) => chapter.id === overId);
    if (chapterHeader) return chapterContainerId(chapterHeader.id);
    return containerIdOfEpisode(overId);
  }

  function handleDragStart() {
    setIsDragging(true);
  }

  // Mentre si trascina un Episodio sopra un gruppo diverso da quello di partenza, si mostra solo
  // un'ANTEPRIMA (un riquadro tratteggiato) nel gruppo su cui si passa sopra — l'Episodio vero resta
  // fermo nel suo gruppo originale (dimmed, come oggi già succede riordinando dentro lo stesso
  // gruppo) e si sposta davvero solo al rilascio (handleDragEnd). Non lo si sposta subito perché
  // farlo vorrebbe dire smontare e ricreare il suo elemento passando da un ramo all'altro
  // dell'albero React (Capitoli diversi = componenti diversi): più rischioso da tenere stabile
  // durante un trascinamento attivo che mostrare solo un'anteprima. La riga reale segue comunque il
  // puntatore via CSS (dnd-kit), indipendentemente dal Capitolo su cui si trova visivamente, quindi
  // l'effetto "live" resta identico all'utente.
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const activeId = String(active.id);
    if (chapterItems.some((chapter) => chapter.id === activeId)) return; // Trascinamento di un Capitolo: non riguarda questa logica.

    if (!over) {
      setDragPreview(null);
      return;
    }
    const overId = String(over.id);

    const sourceContainerId = containerIdOfEpisode(activeId);
    if (!sourceContainerId) return;
    const targetContainerId = resolveOverContainerId(overId);
    if (!targetContainerId || targetContainerId === sourceContainerId) {
      setDragPreview(null);
      return;
    }

    const targetEpisodes = getContainerEpisodes(targetContainerId);
    const overIndexInTarget = targetEpisodes.findIndex((episode) => episode.id === overId);
    const insertIndex = overIndexInTarget === -1 ? targetEpisodes.length : overIndexInTarget;

    setDragPreview((prev) =>
      prev && prev.activeId === activeId && prev.toContainerId === targetContainerId && prev.toIndex === insertIndex
        ? prev
        : { activeId, toContainerId: targetContainerId, toIndex: insertIndex }
    );
  }

  function handleDragCancel() {
    setIsDragging(false);
    setDragPreview(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setIsDragging(false);
    const { active, over } = event;
    const activeId = String(active.id);

    const chapterIndex = chapterItems.findIndex((chapter) => chapter.id === activeId);
    if (chapterIndex !== -1) {
      setDragPreview(null);
      if (!over || active.id === over.id) return;
      const overIndex = chapterItems.findIndex((chapter) => chapter.id === String(over.id));
      if (overIndex === -1) return;
      setChapterItems((prev) => arrayMove(prev, chapterIndex, overIndex));
      startTransition(() => moveChapterToIndex(activeId, overIndex));
      return;
    }

    const preview = dragPreview;
    setDragPreview(null);

    const sourceContainerId = containerIdOfEpisode(activeId);
    if (!sourceContainerId) return;

    if (preview && preview.activeId === activeId) {
      // Rilasciato in un gruppo diverso da quello di partenza: solo ora l'Episodio si sposta
      // davvero, nella posizione già mostrata in anteprima.
      const sourceEpisodes = getContainerEpisodes(sourceContainerId);
      const activeIndex = sourceEpisodes.findIndex((episode) => episode.id === activeId);
      if (activeIndex === -1) return;
      const activeEpisode = sourceEpisodes[activeIndex]!;

      const targetEpisodes = getContainerEpisodes(preview.toContainerId);
      const insertIndex = Math.min(preview.toIndex, targetEpisodes.length);

      setContainerEpisodes(
        sourceContainerId,
        sourceEpisodes.filter((episode) => episode.id !== activeId)
      );
      setContainerEpisodes(preview.toContainerId, [
        ...targetEpisodes.slice(0, insertIndex),
        { ...activeEpisode, chapterId: chapterIdFromContainer(preview.toContainerId) },
        ...targetEpisodes.slice(insertIndex),
      ]);
      startTransition(() => moveEpisodeToIndex(activeId, chapterIdFromContainer(preview.toContainerId), insertIndex));
      return;
    }

    // Nessun cambio di gruppo: riordino dentro lo stesso gruppo, come prima.
    if (!over || active.id === over.id) return;
    const episodes = getContainerEpisodes(sourceContainerId);
    const activeIndex = episodes.findIndex((episode) => episode.id === activeId);
    const overIndex = episodes.findIndex((episode) => episode.id === String(over.id));
    if (activeIndex === -1 || overIndex === -1) return;

    setContainerEpisodes(sourceContainerId, arrayMove(episodes, activeIndex, overIndex));
    startTransition(() => moveEpisodeToIndex(activeId, chapterIdFromContainer(sourceContainerId), overIndex));
  }

  const chaptersList = chapterItems.map((chapter) => ({ id: chapter.id, title: chapter.title }));
  const hasChapters = chapterItems.length > 0;

  function previewFor(containerId: string): { title: string | null; index: number | null } {
    if (!dragPreview || dragPreview.toContainerId !== containerId) return { title: null, index: null };
    const activeEpisode =
      looseItems.find((episode) => episode.id === dragPreview.activeId) ??
      chapterItems.flatMap((chapter) => chapter.episodes).find((episode) => episode.id === dragPreview.activeId);
    return { title: activeEpisode?.title ?? "episode", index: dragPreview.toIndex };
  }

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
      <DndContext
        id={`journey-${journeyId}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          <div>
            {hasChapters && (
              <div className="mb-2 flex items-center justify-between gap-3">
                <CardTitle>No Chapter</CardTitle>
                {looseItems.length > 0 && <NameLooseEpisodesButton journeyId={journeyId} />}
              </div>
            )}
            <EpisodeList
              containerId={LOOSE_CONTAINER_ID}
              journeyId={journeyId}
              chapters={chaptersList}
              episodes={looseItems}
              coverUrl={coverUrl}
              previewTitle={previewFor(LOOSE_CONTAINER_ID).title}
              previewIndex={previewFor(LOOSE_CONTAINER_ID).index}
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
                preview={previewFor(chapterContainerId(chapter.id))}
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
  preview,
}: {
  journeyId: string;
  chapter: Chapter;
  chaptersList: { id: string; title: string }[];
  coverUrl: string | null;
  preview: { title: string | null; index: number | null };
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`mt-4 ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
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
          <CardTitle className="truncate">{chapter.title}</CardTitle>
        </div>
        <ChapterEditButton
          journeyId={journeyId}
          chapter={{ id: chapter.id, title: chapter.title, description: chapter.description }}
          episodeCount={chapter.episodes.length}
        />
      </div>

      <EpisodeList
        containerId={chapterContainerId(chapter.id)}
        journeyId={journeyId}
        chapters={chaptersList}
        episodes={chapter.episodes}
        coverUrl={coverUrl}
        previewTitle={preview.title}
        previewIndex={preview.index}
      />
    </div>
  );
}
