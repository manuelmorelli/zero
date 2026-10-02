import Image from "next/image";
import Link from "next/link";
import { CommunityListingMenu } from "@/components/creator/CommunityListingMenu";
import type { CommunityListingType } from "@/lib/constants/communityListing";
import { ROW } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

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
    <div className={cn(ROW, "group relative flex w-full max-w-[420px] items-center gap-3 p-2 hover:-translate-y-0.5")}>
      {/* Link "invisibile" a tutta la card: il menu a tre puntini sta sopra (z-10), separato
       * invece che annidato in questo link, stesso trucco già usato in JourneyGrid.tsx. */}
      <Link
        href={`/dashboard/community/${type}/${item.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Edit ${item.title}`}
      />
      <span className="relative z-[1] aspect-4/3 w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-surface pointer-events-none sm:w-44">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt=""
            fill
            sizes="176px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 cover-placeholder transition-transform duration-700 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 card-scrim" />
      </span>
      <span className="relative z-[1] min-w-0 flex-1 pointer-events-none pr-8">
        <p className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-ember">
          {item.title}
        </p>
        <p className="mt-0.5 text-sm text-ink-muted">
          {item.isFree ? "Free" : item.price !== null ? `€${item.price}` : "No price set"}
          {item.startsAt ? ` · ${new Date(item.startsAt).toLocaleDateString()}` : ""}
          {typeof item.rsvpCount === "number" && item.rsvpCount > 0
            ? ` · ${item.rsvpCount} going`
            : ""}
        </p>
        <span
          className={`mt-1.5 inline-block rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide ${
            item.status === "DRAFT" ? "bg-ember text-bg" : "border border-border text-ink-muted"
          }`}
        >
          {STATUS_LABEL[item.status]}
        </span>
      </span>
      <div className="relative z-10 self-start">
        <CommunityListingMenu listingId={item.id} listingType={type} title={item.title} status={item.status} />
      </div>
    </div>
  );
}
