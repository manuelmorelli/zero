import { formatCompactNumber } from "@/lib/utils";

type JourneyStatsCardProps = {
  episodesPublished: number;
  totalViews: number;
  likesReceived: number;
  completionRate: number | null;
  /** Sovrapposta alla foto di copertina nell'Hero del Profilo (solo desktop): vedi AboutCard. */
  transparent?: boolean;
};

export function JourneyStatsCard({
  episodesPublished,
  totalViews,
  likesReceived,
  completionRate,
  transparent,
}: JourneyStatsCardProps) {
  const rows = [
    { label: "Episodes Published", value: formatCompactNumber(episodesPublished) },
    { label: "Total Views", value: formatCompactNumber(totalViews) },
    { label: "Likes Received", value: formatCompactNumber(likesReceived) },
    { label: "Completion Rate", value: completionRate === null ? "—" : `${completionRate}%` },
  ];

  return (
    <div
      className={
        transparent
          ? "rounded-2xl border border-white/10 bg-black/40 p-5 shadow-2xl shadow-black/50 backdrop-blur-md"
          : "rounded-xl border border-border bg-surface p-5"
      }
    >
      <h2 className="text-sm font-bold text-ink">Journey Stats</h2>
      <dl className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <dt className="text-sm text-ink-muted">{row.label}</dt>
            <dd className="text-sm font-bold text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
