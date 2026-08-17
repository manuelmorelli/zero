import { BarChart3, Eye, Heart, Target, Users } from "lucide-react";
import { DashboardPanel } from "@/components/creator/DashboardPanel";
import type { JourneyPrivateStats } from "@/lib/dashboard/journeyStats";

type PrivateStatsPanelProps = {
  stats: JourneyPrivateStats;
};

/** Statistiche reali del Journey, visibili solo al creator. Niente trend "+12% questa settimana"
 * come nel mockup Lovable: non abbiamo nessuno storico settimanale salvato da nessuna parte, e un
 * numero inventato qui sarebbe fuorviante — meglio 4 numeri veri senza confronto che un falso trend. */
export function PrivateStatsPanel({ stats }: PrivateStatsPanelProps) {
  const tiles = [
    {
      icon: Eye,
      value: stats.views.toLocaleString("en-US"),
      label: "Total views",
      accent: true,
    },
    {
      icon: Target,
      value: stats.completionRatePercent !== null ? `${stats.completionRatePercent}%` : "—",
      label: "Average completion rate",
      accent: false,
    },
    {
      icon: Users,
      value: stats.completions.toLocaleString("en-US"),
      label: "Completions",
      accent: false,
    },
    {
      icon: Heart,
      value: stats.interactions.toLocaleString("en-US"),
      label: "Interactions",
      accent: false,
    },
  ];

  return (
    <DashboardPanel title="Private Stats" icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />}>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.label}
              className={`flex flex-col rounded-xl border p-3.5 md:p-4 ${
                tile.accent ? "border-ember/40 bg-ember/[0.08]" : "border-border bg-surface-2"
              }`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg border ${
                  tile.accent ? "border-ember/30 bg-ember/15 text-ember" : "border-border bg-surface text-ink-muted"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <dt className="sr-only">{tile.label}</dt>
              <dd className={`mt-2 font-bold tracking-tight text-ink ${tile.accent ? "text-3xl" : "text-2xl"}`}>
                {tile.value}
              </dd>
              <p className="mt-1.5 text-[0.7rem] uppercase tracking-wider text-ink-muted">{tile.label}</p>
            </div>
          );
        })}
      </dl>
      <p className="mt-3 text-[0.72rem] text-ink-faint">
        Visible only to you — never shown on your public profile.
      </p>
    </DashboardPanel>
  );
}
