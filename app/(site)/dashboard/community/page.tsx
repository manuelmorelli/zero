import { FileText, MapPin, MessageCircle, Plus, Video, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { getForumJourneys } from "@/lib/community/forumJourneys";
import { resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import { HorizontalScrollRow } from "@/components/common/HorizontalScrollRow";
import { CommunityListingMenu } from "@/components/creator/CommunityListingMenu";
import { ForumJourneyList } from "@/components/community/ForumJourneyList";
import { ListingCard } from "@/components/community/ListingCard";
import { Reveal } from "@/components/common/Reveal";
import { CARD_ROW_ITEM } from "@/components/ui/cover-card";
import { PageTitle } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { cn } from "@/lib/utils";

type Status = "DRAFT" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";

const STATUS_LABEL: Record<Status, string> = {
  DRAFT: "Draft",
  ACTIVE: "Published",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
};

type ManagedEntry = {
  key: string;
  startsAt: Date | null;
  element: React.ReactNode;
};

type ManagedListing = {
  id: string;
  type: "workshop" | "event" | "digital_product" | "personal_service";
  typeLabel: string;
  icon: LucideIcon;
  title: string;
  status: Status;
  coverKey: string | null;
  startsAt: Date | null;
  priceLabel: string;
};

function formatDate(date: Date | null): string {
  return date ? date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Date to be announced";
}

export default async function CommunityDashboardPage() {
  const { creator } = await requireCreator();

  const [workshops, events, digitalProducts, personalServices, forumJourneys] = await Promise.all([
    prisma.workshop.findMany({ where: { creatorId: creator.id, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.event.findMany({ where: { creatorId: creator.id, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.digitalProduct.findMany({ where: { creatorId: creator.id, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.personalService.findMany({ where: { creatorId: creator.id, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    getForumJourneys(creator.id),
  ]);

  const listings: ManagedListing[] = [
    ...workshops.map((item) => ({
      id: item.id,
      type: "workshop" as const,
      typeLabel: item.isFree ? "Free workshop" : "Workshop",
      icon: Video,
      title: item.title,
      status: item.status,
      coverKey: item.coverUrl,
      startsAt: item.startsAt,
      priceLabel: item.isFree ? "Free" : `€${Number(item.price)}`,
    })),
    ...events.map((item) => ({
      id: item.id,
      type: "event" as const,
      typeLabel: item.isFree ? "Free event" : "Event",
      icon: MapPin,
      title: item.title,
      status: item.status,
      coverKey: item.coverUrl,
      startsAt: item.startsAt,
      priceLabel: item.isFree ? "Free" : `€${Number(item.price)}`,
    })),
    ...digitalProducts.map((item) => ({
      id: item.id,
      type: "digital_product" as const,
      typeLabel: "Digital product",
      icon: FileText,
      title: item.title,
      status: item.status,
      coverKey: item.coverUrl,
      startsAt: null,
      priceLabel: `€${Number(item.price)}`,
    })),
    ...personalServices.map((item) => ({
      id: item.id,
      type: "personal_service" as const,
      typeLabel: "1:1 Service",
      icon: MessageCircle,
      title: item.title,
      status: item.status,
      coverKey: item.coverUrl,
      startsAt: null,
      priceLabel: `€${Number(item.price)}`,
    })),
  ];

  const entries: ManagedEntry[] = await Promise.all(
    listings.map(async (listing) => {
      const coverUrl = listing.coverKey ? await resolveCoverUrl(listing.coverKey) : null;
      const dateText = listing.startsAt ? ` · ${formatDate(listing.startsAt)}` : "";
      return {
        key: `${listing.type}-${listing.id}`,
        startsAt: listing.startsAt,
        element: (
          <ListingCard
            href={`/dashboard/community/${listing.type}/${listing.id}`}
            coverUrl={coverUrl}
            icon={listing.icon}
            chipLabel={`${listing.typeLabel}${dateText}`}
            title={listing.title}
            menu={
              <CommunityListingMenu
                listingId={listing.id}
                listingType={listing.type}
                title={listing.title}
                status={listing.status}
              />
            }
            footer={
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-bold text-ink">{listing.priceLabel}</span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide",
                    listing.status === "DRAFT" ? "bg-ember text-bg" : "border border-border text-ink-muted"
                  )}
                >
                  {STATUS_LABEL[listing.status]}
                </span>
              </div>
            }
          />
        ),
      };
    })
  );

  // Prima le attività con data, dalla più vicina; poi quelle senza data (prodotti, consulenze).
  entries.sort((a, b) => {
    if (a.startsAt && b.startsAt) return a.startsAt.getTime() - b.startsAt.getTime();
    if (a.startsAt) return -1;
    if (b.startsAt) return 1;
    return 0;
  });

  return (
    <main>
      <div className={cn(PAGE_WIDTH.wide, PAGE_SPACING, "space-y-12")}>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-ember">Creator Area</p>
              <PageTitle>Community</PageTitle>
              <p className="mt-1 text-sm text-ink-muted">
                Workshops, Events, Digital Products and 1:1 Services you offer on your Community page.
              </p>
            </div>
            <Button variant="primary" href="/dashboard/community/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          </div>
        </Reveal>

        {entries.length > 0 && (
          <Reveal delayMs={40}>
            <HorizontalScrollRow title="Activities" subtitle="Drafts and published activities, in one place.">
              {entries.map((entry) => (
                <div key={entry.key} className={CARD_ROW_ITEM.event}>
                  {entry.element}
                </div>
              ))}
            </HorizontalScrollRow>
          </Reveal>
        )}

        {forumJourneys.length > 0 && (
          <Reveal delayMs={80}>
            <HorizontalScrollRow title="Forum" subtitle="Open a Journey's forum to read the conversation and moderate it.">
              <ForumJourneyList journeys={forumJourneys} />
            </HorizontalScrollRow>
          </Reveal>
        )}
      </div>
    </main>
  );
}
