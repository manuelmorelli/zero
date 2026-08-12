import { formatRelativeDate } from "@/lib/utils";
import { summarizeUpdate } from "@/lib/updates";
import type { FollowedUpdate } from "@/lib/discovery/updates";

type HeroUpdatesPanelProps = {
  updates: FollowedUpdate[];
};

/**
 * Anteprima degli Updates in Hero, sovrapposta all'immagine di sfondo (in alto a destra):
 * strumento chiave di contatto creator/follower, deve avere visibilità immediata invece di
 * comparire solo scorrendo fino alla sezione "Updates from creators you follow" più in basso.
 * Solo desktop (`lg:`): su schermi stretti sovrapporsi al testo della Hero sarebbe illeggibile.
 */
export function HeroUpdatesPanel({ updates }: HeroUpdatesPanelProps) {
  if (updates.length === 0) return null;

  return (
    <div className="absolute right-6 top-24 z-10 hidden w-full max-w-xs rounded-2xl border border-white/10 bg-black/40 p-5 shadow-2xl shadow-black/50 backdrop-blur-md lg:block lg:right-10 lg:top-28">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">Updates</h2>
        <a href="#updates" className="text-xs font-semibold text-ink-muted transition-colors hover:text-ink">
          View all →
        </a>
      </div>

      <ul className="mt-4 divide-y divide-white/10">
        {updates.slice(0, 4).map((update) => (
          <li key={update.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-ink-muted">
              {update.creatorName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-ink">{update.creatorName}</p>
                <span className="shrink-0 text-[11px] text-ink-faint">
                  {formatRelativeDate(update.publishedAt)}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-ink-muted">{summarizeUpdate(update)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
