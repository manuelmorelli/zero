import { notFound } from "next/navigation";
import { FileText, MapPin, MessageCircle, Video, type LucideIcon } from "lucide-react";
import { findUserByUsernameOrId } from "@/lib/profile/findUserByUsernameOrId";
import { getImagePlaybackUrl } from "@/lib/r2";
import { HorizontalScrollRow } from "@/components/common/HorizontalScrollRow";
import { RsvpButton } from "@/components/profile/RsvpButton";
import { prisma } from "@/lib/prisma";
import { getViewerSession } from "@/lib/session";
import { getFreeEventItems } from "@/lib/community/freeEvents";
import { getForumJourneys } from "@/lib/community/forumJourneys";
import { ForumJourneyList } from "@/components/community/ForumJourneyList";
import { ListingCard } from "@/components/community/ListingCard";
import { SubscribeCard } from "@/components/community/SubscribeCard";
import { ChallengeRow } from "@/components/community/ChallengeRow";
import { MembersRoomRow } from "@/components/community/MembersRoomRow";
import { CARD_ROW_ITEM } from "@/components/ui/cover-card";
import { cn } from "@/lib/utils";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";

/** Pagina "Community" del profilo, vista da chi visita. In cima il riquadro dell'abbonamento
 * (prezzo scelto dal creator, sfida, stanza degli abbonati, regalo di un mese). Sotto le righe
 * a scorrimento: Challenges e Members room (ancora vuote), poi Activities (tutte le attività in
 * un'unica riga, ordinate per data) e Forum (una card per Journey). Una categoria vuota non
 * compare mai. */

type ActivityEntry = {
  key: string;
  startsAt: Date | null;
  element: React.ReactNode;
};

type OfferingItem = {
  icon: LucideIcon;
  id: string;
  type: "workshop" | "event" | "digital_product" | "personal_service";
  coverUrl: string | null;
  title: string;
  chipLabel: string;
  startsAt: Date | null;
  price: string;
  ctaLabel: string;
};

function formatEventMeta(startsAt: Date | null): string {
  if (!startsAt) return "Date to be announced";
  return startsAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatPrice(price: unknown): string {
  return `€${Number(price)}`;
}

export default async function CommunityPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await findUserByUsernameOrId(username);
  if (!user || user.deletedAt) notFound();

  const avatarUrl = user.avatarUrl ? await getImagePlaybackUrl(user.avatarUrl) : null;
  const firstName = user.name.split(" ")[0];

  const creator = await prisma.creator.findUnique({ where: { userId: user.id } });
  const session = await getViewerSession();
  const community = creator ? await prisma.community.findUnique({ where: { creatorId: creator.id } }) : null;
  const priceLabel = community && !community.isFree && community.price ? `€${Number(community.price)} per month` : null;

  const [paidWorkshops, paidEvents, digitalProducts, personalServices, freeEvents, forumJourneys] = creator
    ? await Promise.all([
        prisma.workshop.findMany({
          where: { creatorId: creator.id, deletedAt: null, status: "ACTIVE", isFree: false },
          orderBy: { createdAt: "desc" },
        }),
        prisma.event.findMany({
          where: { creatorId: creator.id, deletedAt: null, status: "ACTIVE", isFree: false },
          orderBy: { createdAt: "desc" },
        }),
        prisma.digitalProduct.findMany({
          where: { creatorId: creator.id, deletedAt: null, status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        }),
        prisma.personalService.findMany({
          where: { creatorId: creator.id, deletedAt: null, status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        }),
        getFreeEventItems(creator.id, session?.user.id ?? null),
        getForumJourneys(creator.id),
      ])
    : [[], [], [], [], [], []];

  const shopItems: OfferingItem[] = await Promise.all(
    digitalProducts.map(async (item) => ({
      icon: FileText,
      id: item.id,
      type: "digital_product" as const,
      coverUrl: item.coverUrl ? await getImagePlaybackUrl(item.coverUrl) : null,
      title: item.title,
      chipLabel: "Digital product",
      startsAt: null,
      price: formatPrice(item.price),
      ctaLabel: "Buy",
    }))
  );

  const workshopsAndEvents: OfferingItem[] = await Promise.all([
    ...paidWorkshops.map(async (item) => ({
      icon: Video,
      id: item.id,
      type: "workshop" as const,
      coverUrl: item.coverUrl ? await getImagePlaybackUrl(item.coverUrl) : null,
      title: item.title,
      chipLabel: `Workshop · ${formatEventMeta(item.startsAt)}`,
      startsAt: item.startsAt,
      price: formatPrice(item.price),
      ctaLabel: "Reserve",
    })),
    ...paidEvents.map(async (item) => ({
      icon: MapPin,
      id: item.id,
      type: "event" as const,
      coverUrl: item.coverUrl ? await getImagePlaybackUrl(item.coverUrl) : null,
      title: item.title,
      chipLabel: `Event · ${formatEventMeta(item.startsAt)}`,
      startsAt: item.startsAt,
      price: formatPrice(item.price),
      ctaLabel: "Reserve",
    })),
  ]);

  const consultingSessions: OfferingItem[] = await Promise.all(
    personalServices.map(async (item) => ({
      icon: MessageCircle,
      id: item.id,
      type: "personal_service" as const,
      coverUrl: item.coverUrl ? await getImagePlaybackUrl(item.coverUrl) : null,
      title: item.title,
      chipLabel: "1:1 Service",
      startsAt: null,
      price: formatPrice(item.price),
      ctaLabel: "Book a call",
    }))
  );

  const activities: ActivityEntry[] = [
    ...freeEvents.map((item) => {
      const startsAt = item.startsAt ? new Date(item.startsAt) : null;
      const kindLabel = item.kind === "workshop" ? "Workshop" : "Event";
      return {
        key: `free-${item.kind}-${item.id}`,
        startsAt,
        element: (
          <ListingCard
            href={`/community/${item.kind}/${item.id}`}
            coverUrl={item.coverUrl}
            icon={item.kind === "workshop" ? Video : MapPin}
            chipLabel={`Free · ${kindLabel} · ${formatEventMeta(startsAt)}`}
            title={item.title}
            footer={
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-base text-ink-muted">{item.rsvpCount} going</span>
                <RsvpButton
                  kind={item.kind}
                  id={item.id}
                  initialGoing={item.going}
                  isLoggedIn={Boolean(session)}
                />
              </div>
            }
          />
        ),
      };
    }),
    ...[...shopItems, ...workshopsAndEvents, ...consultingSessions].map((item) => ({
      key: `${item.type}-${item.id}`,
      startsAt: item.startsAt,
      element: (
        <ListingCard
          href={`/community/${item.type}/${item.id}`}
          coverUrl={item.coverUrl}
          icon={item.icon}
          chipLabel={item.chipLabel}
          title={item.title}
          footer={
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-bold text-ink">{item.price}</span>
              <span
                title="Coming soon: payments aren't connected yet"
                className="cursor-not-allowed rounded-full bg-surface-2 px-3.5 py-1.5 text-sm font-semibold text-ink-faint"
              >
                {item.ctaLabel}
              </span>
            </div>
          }
        />
      ),
    })),
  ];

  // Prima le attività con data, dalla più vicina; poi quelle senza data (prodotti, consulenze).
  activities.sort((a, b) => {
    if (a.startsAt && b.startsAt) return a.startsAt.getTime() - b.startsAt.getTime();
    if (a.startsAt) return -1;
    if (b.startsAt) return 1;
    return 0;
  });

  return (
    <main>
      <div className={cn(PAGE_WIDTH.wide, PAGE_SPACING)}>
        <SubscribeCard
          name={user.name}
          username={user.username ?? username}
          avatarUrl={avatarUrl}
          priceLabel={priceLabel}
        />

        <ChallengeRow firstName={firstName} />
        <MembersRoomRow firstName={firstName} />

        {activities.length > 0 && (
          <div className="mt-12">
            <HorizontalScrollRow title="Activities" subtitle={`Everything ${firstName} organizes, in one place.`}>
              {activities.map((activity) => (
                <div key={activity.key} className={CARD_ROW_ITEM.event}>
                  {activity.element}
                </div>
              ))}
            </HorizontalScrollRow>
          </div>
        )}

        {forumJourneys.length > 0 && (
          <div className="mt-12">
            <HorizontalScrollRow
              title="Forum"
              subtitle={`Text-only discussion between people doing ${firstName}'s Journeys and ${firstName}.`}
            >
              <ForumJourneyList journeys={forumJourneys} />
            </HorizontalScrollRow>
          </div>
        )}
      </div>
    </main>
  );
}
