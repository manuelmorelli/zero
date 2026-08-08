import { EpisodeItem } from "@/components/creator/EpisodeItem";

type EpisodeListItem = {
  id: string;
  title: string;
  caption: string | null;
  videoKey: string | null;
  occurredAt: Date;
  chapterId: string | null;
};

// Il trascinamento per riordinare non vive più qui: si è spostato nel Profilo (vedi
// components/profile/EpisodeReorderSection.tsx), più vicino a dove il creator vede già i propri
// episodi pubblicati. Questa lista resta per creare/modificare/eliminare, in ordine di lettura.
export function EpisodeList({
  journeyId,
  chapters,
  episodes,
}: {
  journeyId: string;
  chapters: { id: string; title: string }[];
  episodes: EpisodeListItem[];
}) {
  if (episodes.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink-muted">
        You haven&apos;t added any episodes yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {episodes.map((episode) => (
        <EpisodeItem key={episode.id} journeyId={journeyId} chapters={chapters} episode={episode} />
      ))}
    </div>
  );
}
