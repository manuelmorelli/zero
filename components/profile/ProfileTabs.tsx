import Link from "next/link";
import type { ReactNode } from "react";

export type ProfileTab = "overview" | "journeys";

const TABS: { key: ProfileTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "journeys", label: "Journeys" },
];

type ProfileTabsProps = {
  basePath: string;
  activeTab: ProfileTab;
  /** Bottoni Creator Economy (Become a Member / Shop), allineati a destra sulla stessa riga. */
  actions?: ReactNode;
};

export function ProfileTabs({ basePath, activeTab, actions }: ProfileTabsProps) {
  return (
    <div className="py-1">
      <div className="no-scrollbar mx-auto flex max-w-[1400px] items-center gap-2.5 overflow-x-auto px-5 md:px-[calc(4.43%+2rem)]">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const href = tab.key === "overview" ? basePath : `${basePath}?tab=${tab.key}`;
          return (
            <Link
              key={tab.key}
              href={href}
              className={`shrink-0 rounded-full border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] px-4 py-2 text-sm text-white backdrop-blur-md transition-colors ${
                isActive ? "" : "opacity-70 hover:opacity-100"
              }`}
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
