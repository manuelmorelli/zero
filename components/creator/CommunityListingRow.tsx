import Link from "next/link";
import type { CommunityListingType } from "@/lib/constants/communityListing";

export type ListingRowItem = {
  id: string;
  title: string;
  status: "DRAFT" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  isFree: boolean;
  price: number | null;
  startsAt: string | null;
  rsvpCount?: number;
};

const STATUS_LABEL: Record<ListingRowItem["status"], string> = {
  DRAFT: "Draft",
  ACTIVE: "Published",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
};

export function CommunityListingRow({ type, item }: { type: CommunityListingType; item: ListingRowItem }) {
  return (
    <Link
      href={`/dashboard/community/${type}/${item.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 transition-colors hover:border-ink-muted"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
        <p className="mt-0.5 text-xs text-ink-muted">
          {item.isFree ? "Free" : item.price !== null ? `€${item.price}` : "No price set"}
          {item.startsAt ? ` · ${new Date(item.startsAt).toLocaleDateString()}` : ""}
          {typeof item.rsvpCount === "number" && item.rsvpCount > 0
            ? ` · ${item.rsvpCount} going`
            : ""}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
          item.status === "DRAFT" ? "bg-ember text-bg" : "border border-border text-ink-muted"
        }`}
      >
        {STATUS_LABEL[item.status]}
      </span>
    </Link>
  );
}
