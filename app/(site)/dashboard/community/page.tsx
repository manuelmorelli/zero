import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { getForumJourneys } from "@/lib/community/forumJourneys";
import { CommunityListingRow, type ListingRowItem } from "@/components/creator/CommunityListingRow";
import { ForumListingRow } from "@/components/creator/ForumListingRow";
import { Reveal } from "@/components/common/Reveal";
import { resolveCoverUrl } from "@/lib/media/resolveCoverUrl";
import { PageTitle, SectionTitle } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";
import { cn } from "@/lib/utils";

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

  const [workshops, events, digitalProducts, personalServices, forumJourneys] = await Promise.all([
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
    getForumJourneys(creator.id),
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
      <div className={cn(PAGE_WIDTH.wide, PAGE_SPACING, "max-w-[1000px] space-y-8")}>
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

        {sections.map(
          (section, index) =>
            section.items.length > 0 && (
              <Reveal key={section.type} delayMs={40 + index * 30}>
                <section>
                  <SectionTitle>{section.title}</SectionTitle>
                  <div className="mt-3 space-y-2.5">
                    {section.items.map((item) => (
                      <CommunityListingRow key={item.id} type={section.type} item={item} />
                    ))}
                  </div>
                </section>
              </Reveal>
            )
        )}

        {forumJourneys.length > 0 && (
          <Reveal delayMs={40 + sections.length * 30}>
            <section>
              <SectionTitle>Forum</SectionTitle>
              <p className="mt-1 text-sm text-ink-muted">
                Open a Journey&apos;s forum to read the conversation and moderate it.
              </p>
              <div className="mt-3 space-y-2.5">
                {forumJourneys.map((journey) => (
                  <ForumListingRow
                    key={journey.id}
                    id={journey.id}
                    title={journey.title}
                    coverUrl={journey.coverUrl}
                    messageCount={journey.messageCount}
                  />
                ))}
              </div>
            </section>
          </Reveal>
        )}
      </div>
    </main>
  );
}
