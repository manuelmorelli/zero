import { BarChart3, Eye, Heart, Target, Users } from "lucide-react";
import { DashboardPanel } from "@/components/creator/DashboardPanel";
import { PANEL, PANEL_ACCENT } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import type { JourneyPrivateStats } from "@/lib/dashboard/journeyStats";

type PrivateStatsPanelProps = {
  stats: JourneyPrivateStats;
  /** "Private Stats" per il singolo Journey, "All Journeys" per il riepilogo generale in cima
   * alla Dashboard (vedi lib/dashboard/creatorStats.ts). */
  title?: string;
};

/** Statistiche reali del Journey (o di tutti i Journey insieme), visibili solo al creator. Niente
 * trend "+12% questa settimana" come nel mockup Lovable: non abbiamo nessuno storico settimanale
 * salvato da nessuna parte, e un numero inventato qui sarebbe fuorviante — meglio 4 numeri veri
 * senza confronto che un falso trend. */
export function PrivateStatsPanel({ stats, title = "Private Stats" }: PrivateStatsPanelProps) {
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
    <DashboardPanel title={title} icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />}>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.label}
              className={cn(tile.accent ? PANEL_ACCENT : PANEL, "flex flex-col rounded-xl p-3.5 md:p-4")}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg border ${
                  tile.accent ? "border-ember-line bg-ember-soft text-ember" : "border-border bg-surface text-ink-muted"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <dt className="sr-only">{tile.label}</dt>
              <dd className={`mt-2 font-bold tracking-tight text-ink ${tile.accent ? "text-3xl" : "text-2xl"}`}>
                {tile.value}
              </dd>
              <p className="mt-1.5 text-sm uppercase tracking-wider text-ink-muted">{tile.label}</p>
            </div>
          );
        })}
      </dl>
      <p className="mt-3 text-sm text-ink-faint">
        Visible only to you, never shown on your public profile.
      </p>
    </DashboardPanel>
  );
}
