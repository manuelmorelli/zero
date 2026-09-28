import Image from "next/image";
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
  coverUrl?: string | null;
};

const STATUS_LABEL: Record<ListingRowItem["status"], string> = {
  DRAFT: "Draft",
  ACTIVE: "Published",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
};

// Stesse dimensioni e stesso "poster style" delle card episodio nella pagina Journey
// (app/(site)/journeys/[id]/page.tsx, EpisodeRow), adattate a un contesto senza Play: qui il
// bordo/ombra ember al passaggio del mouse e la sfumatura sulla copertina restano, l'icona di
// riproduzione no (una card Community non si "guarda").
export function CommunityListingRow({ type, item }: { type: CommunityListingType; item: ListingRowItem }) {
  return (
    <Link
      href={`/dashboard/community/${type}/${item.id}`}
      className="group flex w-full max-w-[420px] items-center gap-3 rounded-xl border border-border bg-surface-2 p-2 text-left shadow-[0_20px_40px_-22px_rgba(0,0,0,45%)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-ember/40 hover:shadow-[0_20px_40px_-16px_rgba(226,145,77,50%)]"
    >
      <span className="relative aspect-4/3 w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-surface sm:w-44">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt=""
            fill
            sizes="176px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface to-black transition-transform duration-700 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(226,145,77,28%),_transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </span>
      <span className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-ember">
          {item.title}
        </p>
        <p className="mt-0.5 text-xs text-ink-muted">
          {item.isFree ? "Free" : item.price !== null ? `€${item.price}` : "No price set"}
          {item.startsAt ? ` · ${new Date(item.startsAt).toLocaleDateString()}` : ""}
          {typeof item.rsvpCount === "number" && item.rsvpCount > 0
            ? ` · ${item.rsvpCount} going`
            : ""}
        </p>
        <span
          className={`mt-1.5 inline-block rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
            item.status === "DRAFT" ? "bg-ember text-bg" : "border border-border text-ink-muted"
          }`}
        >
          {STATUS_LABEL[item.status]}
        </span>
      </span>
    </Link>
  );
}
