import { notFound } from "next/navigation";
import { Check, FileText, MapPin, MessageCircle, Video, type LucideIcon } from "lucide-react";
import { findUserByUsernameOrId } from "@/lib/profile/findUserByUsernameOrId";
import { getImagePlaybackUrl } from "@/lib/r2";
import { FadeImage } from "@/components/common/FadeImage";
import { HorizontalScrollRow } from "@/components/common/HorizontalScrollRow";
import { RsvpButton } from "@/components/profile/RsvpButton";
import { prisma } from "@/lib/prisma";
import { getViewerSession } from "@/lib/session";
import { getFreeEventItems } from "@/lib/community/freeEvents";
import { getForumJourneys } from "@/lib/community/forumJourneys";
import { ForumJourneyList } from "@/components/community/ForumJourneyList";
import { ListingCard } from "@/components/community/ListingCard";
import { CARD_ROW_ITEM } from "@/components/ui/cover-card";
import { PANEL_ACCENT } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/heading";
import { cn } from "@/lib/utils";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";

/** Pagina "Community" del profilo, vista da chi visita. Il riquadro in cima (abbonamento mensile,
 * Punto 7 dell'allineamento) resta fisso. Sotto due righe, ciascuna con il suo scorrimento laterale
 * come Journey e Journeyers (2026-10-03, richiesto da Manuel): Activities (tutte le attività in un'unica
 * riga, ordinate per data) e Forum (una card per Journey, su una riga sua). Una categoria vuota non
 * compare mai. */
const MONTHLY_PRICE = "€9";

const benefits = [
  "Exclusive video episodes, published only for members",
  "Downloadable documents and PDF worksheets",
  "Practical maps and step-by-step guides",
  "A member badge next to your name everywhere on Zero",
];

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
        <section className={cn(PANEL_ACCENT, "mx-auto max-w-4xl sm:p-8")}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface-2">
                  {avatarUrl ? (
                    <FadeImage src={avatarUrl} alt={user.name} fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-ink-muted">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <PageTitle className="truncate">{user.name}</PageTitle>
                  <p className="truncate text-sm text-ink-muted">@{user.username ?? username}</p>
                </div>
              </div>

              <p className="mt-5 max-w-[48ch] text-sm leading-relaxed text-ink-muted">
                Everything {firstName} organizes, free and paid: upcoming events, exclusive membership perks,
                workshops, digital products and 1:1 sessions.
              </p>

              <ul className="mt-5 space-y-2.5">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2.5 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-3 sm:w-48 sm:items-stretch">
              <div>
                <p className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-ink">{MONTHLY_PRICE}</span>
                  <span className="text-sm text-ink-muted">/month</span>
                </p>
                <p className="mt-1 text-sm text-ink-muted">Cancel anytime.</p>
              </div>
              <Button variant="secondary" disabled title="Coming soon: payments aren't connected yet">
                Subscribe (Coming Soon)
              </Button>
            </div>
          </div>
        </section>

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
