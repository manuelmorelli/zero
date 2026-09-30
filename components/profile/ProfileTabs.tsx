import Link from "next/link";
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
};

export function ProfileTabs({ basePath, activeTab }: ProfileTabsProps) {
  return (
    <div className="py-1">
      <div className={cn("no-scrollbar flex items-center gap-2.5 overflow-x-auto", PAGE_WIDTH.wideCover)}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const href = tab.key === "overview" ? basePath : `${basePath}?tab=${tab.key}`;
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                BUTTON_VARIANTS.secondary,
                "text-on-photo shadow-glow backdrop-blur-md transition-all duration-300",
                !isActive && "opacity-70 hover:opacity-100"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
