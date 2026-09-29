import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { DashboardPanel } from "@/components/creator/DashboardPanel";
import { CommunityListingRow, EmptyListingRow, type ListingRowItem } from "@/components/creator/CommunityListingRow";
import { Reveal } from "@/components/common/Reveal";
import { resolveCoverUrl } from "@/lib/media/resolveCoverUrl";

async function toRowItems(
  rows: Array<{
    id: string;
    title: string;
    status: string;
    isFree?: boolean;
    price: unknown;
    startsAt?: Date | null;
    coverUrl?: string | null;
    _count?: { rsvps: number };
  }>
): Promise<ListingRowItem[]> {
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      title: row.title,
      status: row.status as ListingRowItem["status"],
      isFree: Boolean(row.isFree),
      price: row.price === null ? null : Number(row.price),
      startsAt: row.startsAt ? row.startsAt.toISOString() : null,
      rsvpCount: row._count?.rsvps,
      coverUrl: await resolveCoverUrl(row.coverUrl ?? null),
    }))
  );
}

export default async function CommunityDashboardPage() {
  const { creator } = await requireCreator();

  const [workshops, events, digitalProducts, personalServices] = await Promise.all([
    prisma.workshop.findMany({
      where: { creatorId: creator.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { rsvps: true } } },
    }),
    prisma.event.findMany({
      where: { creatorId: creator.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { rsvps: true } } },
    }),
    prisma.digitalProduct.findMany({
      where: { creatorId: creator.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.personalService.findMany({
      where: { creatorId: creator.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const [workshopItems, eventItems, digitalProductItems, personalServiceItems] = await Promise.all([
    toRowItems(workshops),
    toRowItems(events),
    toRowItems(digitalProducts),
    toRowItems(personalServices),
  ]);

  const sections: Array<{ title: string; type: "workshop" | "event" | "digital_product" | "personal_service"; items: ListingRowItem[] }> = [
    { title: "Workshops", type: "workshop", items: workshopItems },
    { title: "Events", type: "event", items: eventItems },
    { title: "Digital Products", type: "digital_product", items: digitalProductItems },
    { title: "1:1 Services", type: "personal_service", items: personalServiceItems },
  ];

  return (
    <main>
      <div className="mx-auto max-w-[1000px] space-y-4 px-5 pb-16 pt-24 md:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-ember">Creator area</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight">Community</h1>
              <p className="mt-1 text-sm text-ink-muted">
                Workshops, Events, Digital Products and 1:1 Services you offer on your Community page.
              </p>
            </div>
            <Link
              href="/dashboard/community/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-muted"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </Link>
          </div>
        </Reveal>

        {sections.map((section, index) => (
          <Reveal key={section.type} delayMs={40 + index * 30}>
            <DashboardPanel title={section.title}>
              {section.items.length === 0 ? (
                <EmptyListingRow />
              ) : (
                <div className="space-y-2.5">
                  {section.items.map((item) => (
                    <CommunityListingRow key={item.id} type={section.type} item={item} />
                  ))}
                </div>
              )}
            </DashboardPanel>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
