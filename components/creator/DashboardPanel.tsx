import type { ReactNode } from "react";

type DashboardPanelProps = {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Riquadro condiviso da tutte le sezioni della Dashboard (selettore Journey, statistiche,
 * capitoli/episodi): stesso involucro visivo per tutte, un solo posto da aggiornare. */
export function DashboardPanel({ title, icon, action, className, children }: DashboardPanelProps) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-4 md:p-5 ${className ?? ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
          {icon ? <span className="text-ember">{icon}</span> : null}
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
