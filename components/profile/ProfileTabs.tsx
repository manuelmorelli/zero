import Link from "next/link";
import type { ReactNode } from "react";
import { BUTTON_VARIANTS } from "@/components/ui/button";
import { PAGE_WIDTH } from "@/components/ui/page-container";
import { cn } from "@/lib/utils";

export type ProfileTab = "overview" | "journeys";

const TABS: { key: ProfileTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "journeys", label: "Journeys" },
];

type ProfileTabsProps = {
  basePath: string;
  activeTab: ProfileTab;
  /** Altri link nella stessa riga, stesso stile dei tab (es. Community): sempre subito dopo
   * Overview/Journeys, mai separati in un'altra riga (richiesto da Manuel, 2026-10-01). */
  actions?: ReactNode;
};

export function ProfileTabs({ basePath, activeTab, actions }: ProfileTabsProps) {
  return (
    <div className="-mt-5 py-1">
      {/* overflow-x-auto trasforma anche lo scroll verticale in "auto" (regola CSS), tagliando il
       * bagliore del bottone (sempre acceso su questi, non solo all'hover) se non c'è spazio
       * sopra: su Overview attivo (sempre a piena opacità) si vedeva tagliato in alto, mentre su
       * Journeys/Community (opacità ridotta) il taglio si notava meno. pt-5 riserva spazio
       * sufficiente al bagliore, -mt-5 sul contenitore esterno lo compensa così l'impaginazione
       * non si sposta (stessa tecnica di HorizontalScrollRow, qui con margine maggiore). */}
      <div className={cn("no-scrollbar flex items-center gap-2.5 overflow-x-auto pt-5", PAGE_WIDTH.wideCover)}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const href = tab.key === "overview" ? basePath : `${basePath}?tab=${tab.key}`;
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                BUTTON_VARIANTS.secondary,
                "profile-hero-glass profile-tab-glass text-on-photo transition-all duration-300 hover:-translate-y-1",
                !isActive && "opacity-70 hover:opacity-100"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
        {actions}
      </div>
    </div>
  );
}
