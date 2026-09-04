import Link from "next/link";

export type ProfileTab = "overview" | "journeys";

const TABS: { key: ProfileTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "journeys", label: "Journeys" },
];

type ProfileTabsProps = {
  basePath: string;
  activeTab: ProfileTab;
};

export function ProfileTabs({ basePath, activeTab }: ProfileTabsProps) {
  return (
    <div className="sticky top-12 z-40 py-1">
      <div className="no-scrollbar mx-auto flex max-w-[1400px] gap-2.5 overflow-x-auto px-5 md:px-8">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const href = tab.key === "overview" ? basePath : `${basePath}?tab=${tab.key}`;
          return (
            <Link
              key={tab.key}
              href={href}
              className={`shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-md transition-colors ${
                isActive ? "text-ember" : "text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
