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
    <div className="border-b border-border">
      <div className="mx-auto flex max-w-6xl gap-1 px-6">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const href = tab.key === "overview" ? basePath : `${basePath}?tab=${tab.key}`;
          return (
            <Link
              key={tab.key}
              href={href}
              className={`relative px-4 py-3.5 text-sm font-semibold transition-colors ${
                isActive ? "text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
              {isActive && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-ink" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
