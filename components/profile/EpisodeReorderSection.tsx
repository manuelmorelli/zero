import { EpisodeReorderGroup } from "@/components/profile/EpisodeReorderGroup";
import type { TimelineGroup } from "@/lib/journey/episodeTimeline";

type EpisodeReorderSectionProps = {
  groups: TimelineGroup[];
};

/** Visibile solo sul proprio Profilo (vedi app/profile/[username]/page.tsx): prima il drag & drop
 * viveva nella Dashboard, incastrato tra le altre sezioni di gestione — ora si trascina qui,
 * direttamente sopra gli episodi già pubblicati. Stesso ordine mostrato sulla pagina episodi
 * pubblica (entrambi riusano lib/journey/episodeTimeline.ts). */
export function EpisodeReorderSection({ groups }: EpisodeReorderSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-bold tracking-tight text-ink">Reorder your episodes</h2>
      <p className="mt-1 text-sm text-ink-muted">Drag an episode to change where it appears.</p>

      <div className="mt-5 space-y-6">
        {groups.map((group) => (
          <div key={group.chapterId ?? "loose"}>
            {group.chapterTitle && (
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                {group.chapterTitle}
              </h3>
            )}
            <EpisodeReorderGroup
              dndId={`profile-reorder-${group.chapterId ?? "loose"}`}
              episodes={group.episodes}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
