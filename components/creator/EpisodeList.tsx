import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { EpisodeItem } from "@/components/creator/EpisodeItem";
import { NOTICE, PANEL_DASHED } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

type EpisodeListItem = {
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

/** Lista trascinabile (solo la parte "sortable": il DndContext che la governa vive nel genitore,
 * ChaptersAndEpisodesPanel — un DndContext annidato dentro un altro rompeva il trascinamento degli
 * episodi dentro un Capitolo, per questo qui non ce n'è più uno proprio). `containerId` la rende
 * anche una zona di rilascio valida di per sé, anche da vuota: serve al genitore per riconoscere
 * quando un episodio viene trascinato da un gruppo (Capitolo, o "No Chapter") a un altro.
 *
 * `previewTitle`/`previewIndex`: mostrati SOLO nel gruppo su cui si sta trascinando un episodio in
 * arrivo da un ALTRO gruppo (mai in quello di partenza, che nel frattempo resta invariato — vedi il
 * commento in ChaptersAndEpisodesPanel su perché l'episodio trascinato non viene spostato "per
 * davvero" nello stato finché non lo si rilascia). È solo un'anteprima visiva, non trascinabile. */
export function EpisodeList({
  containerId,
  journeyId,
  chapters,
  episodes,
  coverUrl,
  previewTitle,
  previewIndex,
}: {
  containerId: string;
  journeyId: string;
  chapters: { id: string; title: string }[];
  episodes: EpisodeListItem[];
  coverUrl?: string | null;
  previewTitle?: string | null;
  previewIndex?: number | null;
}) {
  const { setNodeRef } = useDroppable({ id: containerId });
  const hasPreview = previewTitle != null && previewIndex != null;

  const rows: Array<{ kind: "episode"; episode: EpisodeListItem } | { kind: "preview" }> = episodes.map(
    (episode) => ({ kind: "episode", episode })
  );
  if (hasPreview) {
    rows.splice(Math.min(previewIndex!, rows.length), 0, { kind: "preview" });
  }

  return (
    <SortableContext items={episodes.map((episode) => episode.id)} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className="space-y-2">
        {rows.length === 0 && (
          <p className={NOTICE}>
            You haven&apos;t added any episodes yet.
          </p>
        )}
        {rows.map((row) =>
          row.kind === "preview" ? (
            <div
              key="drop-preview"
              className={cn(PANEL_DASHED, "p-3 text-sm font-medium text-ember")}
            >
              Drop “{previewTitle}” here
            </div>
          ) : (
            <EpisodeItem
              key={row.episode.id}
              journeyId={journeyId}
              chapters={chapters}
              coverUrl={coverUrl}
              episode={row.episode}
            />
          )
        )}
      </div>
    </SortableContext>
  );
}
