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
    <div className="sticky top-12 z-40 border-y border-border bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-6">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const href = tab.key === "overview" ? basePath : `${basePath}?tab=${tab.key}`;
          return (
            <Link
              key={tab.key}
              href={href}
              className={`relative shrink-0 py-2.5 text-sm transition-colors ${
                isActive ? "text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
              {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-ember" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
