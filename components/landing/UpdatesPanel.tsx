type UpdateItem = {
  id: string;
  name: string;
  timeAgo: string;
  caption: string;
};

// Dati finti in attesa della funzione reale di pubblicazione Update (modello Update in prisma/schema.prisma).
const UPDATES: UpdateItem[] = [
  { id: "1", name: "Marco R.", timeAgo: "2m ago", caption: "Sunrise hike. Clear mind, stronger focus." },
  { id: "2", name: "Sara J.", timeAgo: "15m ago", caption: "Discipline today, freedom tomorrow." },
  { id: "3", name: "David L.", timeAgo: "1h ago", caption: "Some days are harder. Keep going anyway." },
  { id: "4", name: "Emma W.", timeAgo: "2h ago", caption: "Learning, growing, becoming." },
  { id: "5", name: "James T.", timeAgo: "3h ago", caption: "Progress is progress. No matter how small." },
];

export function UpdatesPanel() {
  return (
    <div
      id="updates"
      className="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-2xl shadow-black/50 backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">Updates</h2>
        <a
          href="#updates"
          className="text-xs font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          View all →
        </a>
      </div>

      <ul className="mt-4 divide-y divide-white/10">
        {UPDATES.map((update) => (
          <li key={update.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-ink-muted">
              {update.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-ink">
                  {update.name}
                </p>
                <span className="shrink-0 text-[11px] text-ink-faint">
                  {update.timeAgo}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-ink-muted">
                {update.caption}
              </p>
            </div>
            <div className="h-10 w-10 shrink-0 rounded-lg bg-white/10" />
          </li>
        ))}
      </ul>
    </div>
  );
}
