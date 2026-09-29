import type { ReactNode } from "react";
import { SectionTitle } from "@/components/ui/heading";
import { PANEL } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

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
    <section className={cn(PANEL, "md:p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle className="flex items-center gap-2">
          {icon ? <span className="text-ember">{icon}</span> : null}
          {title}
        </SectionTitle>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
