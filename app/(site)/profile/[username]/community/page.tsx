import { notFound } from "next/navigation";
import { Check, FileText, Lock, Map, MapPin, MessageCircle, Play, Video, type LucideIcon } from "lucide-react";
import { findUserByUsernameOrId } from "@/lib/profile/findUserByUsernameOrId";
import { getImagePlaybackUrl } from "@/lib/r2";
import { FadeImage } from "@/components/common/FadeImage";
import { prisma } from "@/lib/prisma";
import { getViewerSession } from "@/lib/session";
import { getFreeEventItems } from "@/lib/community/freeEvents";
import { getForumJourneys } from "@/lib/community/forumJourneys";
import { FreeEventsSection } from "@/components/profile/FreeEventsSection";
import { ForumJourneyList } from "@/components/community/ForumJourneyList";
import { ListingCard, COMMUNITY_CARD_GRID } from "@/components/community/ListingCard";
import { PANEL_ACCENT } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { PageTitle, SectionTitle } from "@/components/ui/heading";
import { cn } from "@/lib/utils";
import { PAGE_SPACING, PAGE_WIDTH } from "@/components/ui/page-container";

/** Pagina "Community" del profilo (ex "Subscribe", rinominata il 2026-09-26 su richiesta di
 * Manuel: un follower deve poter vedere qui TUTTO quello che il creator organizza, gratis o a
 * pagamento, non solo le offerte a pagamento). Il riquadro in cima (abbonamento mensile, Punto 7
 * dell'allineamento) resta fisso e invariato; sotto, due colonne affiancate (2026-10-03, richiesto
 * da Manuel): Activities a sinistra (eventi gratuiti, Shop, Workshop & Eventi, 1:1 Consulting) e
 * Forum a destra — spazi separati, mai uniti in un'unica colonna verticale. */
const MONTHLY_PRICE = "€9";

const benefits = [
  "Exclusive video episodes, published only for members",
  "Downloadable documents and PDF worksheets",
  "Practical maps and step-by-step guides",
  "A member badge next to your name everywhere on Zero",
];

const insideItems = [
  { kind: "video" as const, title: "Extended behind-the-scenes cut", meta: "Video · Members only" },
  { kind: "document" as const, title: "The recovery worksheet", meta: "PDF · Members only" },
  { kind: "map" as const, title: "Route map and guide", meta: "Guide · Members only" },
];

type OfferingCard = {
  icon: LucideIcon;
  id: string;
  type: "workshop" | "event" | "digital_product" | "personal_service";
  coverUrl: string | null;
  title: string;
  chipLabel: string;
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

  const shopItems: OfferingCard[] = await Promise.all(
    digitalProducts.map(async (item) => ({
      icon: FileText,
      id: item.id,
      type: "digital_product" as const,
      coverUrl: item.coverUrl ? await getImagePlaybackUrl(item.coverUrl) : null,
      title: item.title,
      chipLabel: "Digital product",
      price: formatPrice(item.price),
      ctaLabel: "Buy",
    }))
  );

  const workshopsAndEvents: OfferingCard[] = await Promise.all([
    ...paidWorkshops.map(async (item) => ({
      icon: Video,
      id: item.id,
      type: "workshop" as const,
      coverUrl: item.coverUrl ? await getImagePlaybackUrl(item.coverUrl) : null,
      title: item.title,
      chipLabel: `Workshop · ${formatEventMeta(item.startsAt)}`,
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
      price: formatPrice(item.price),
      ctaLabel: "Reserve",
    })),
  ]);

  const consultingSessions: OfferingCard[] = await Promise.all(
    personalServices.map(async (item) => ({
      icon: MessageCircle,
      id: item.id,
      type: "personal_service" as const,
      coverUrl: item.coverUrl ? await getImagePlaybackUrl(item.coverUrl) : null,
      title: item.title,
      chipLabel: "1:1 Service",
      price: formatPrice(item.price),
      ctaLabel: "Book a call",
    }))
  );

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
                Everything {user.name.split(" ")[0]} organizes, free and paid: upcoming events, exclusive
                membership perks, workshops, digital products and 1:1 sessions.
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

        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
          <div>
            <SectionTitle>Activities</SectionTitle>
            <p className="mt-1 text-sm text-ink-muted">
              Everything {user.name.split(" ")[0]} organizes: membership perks, workshops, events, products and 1:1
              sessions.
            </p>

            {freeEvents.length > 0 && (
              <div className="mt-6">
                <FreeEventsSection items={freeEvents} isLoggedIn={Boolean(session)} gridClassName={COMMUNITY_CARD_GRID} />
              </div>
            )}

            <section className="mt-10">
              <SectionTitle>What&apos;s Inside</SectionTitle>
              <p className="mt-1 text-sm text-ink-muted">A preview of what members unlock.</p>

              <div className={`mt-4 ${COMMUNITY_CARD_GRID}`}>
                {insideItems.map((item) => (
                  <div key={item.title} className="overflow-hidden rounded-xl border border-border bg-surface">
                    <div className="relative flex aspect-video items-center justify-center border-b border-border bg-surface-2">
                      {item.kind === "video" && <Play className="h-8 w-8 text-ink-faint" aria-hidden="true" />}
                      {item.kind === "document" && <FileText className="h-8 w-8 text-ink-faint" aria-hidden="true" />}
                      {item.kind === "map" && <Map className="h-8 w-8 text-ink-faint" aria-hidden="true" />}
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-ember-line bg-ember-soft px-2 py-0.5 text-sm font-semibold uppercase tracking-wide text-ink-muted backdrop-blur-md">
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        Locked
                      </span>
                    </div>
                    <div className="p-3.5">
                      <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-sm text-ink-muted">{item.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <OfferingSection
              title="Shop"
              description={`Digital products from ${user.name.split(" ")[0]}, sold individually.`}
              items={shopItems}
            />

            <OfferingSection
              title="Workshops & Events"
              description="Live sessions and meetups, booked individually."
              items={workshopsAndEvents}
            />

            <OfferingSection
              title="1:1 Consulting"
              description={`Book a call with ${user.name.split(" ")[0]}, sold individually by duration.`}
              items={consultingSessions}
            />
          </div>

          <div>
            <SectionTitle>Forum</SectionTitle>
            <p className="mt-1 text-sm text-ink-muted">
              Text-only discussion between people doing {user.name.split(" ")[0]}&apos;s Journeys and{" "}
              {user.name.split(" ")[0]}, separate from Activities.
            </p>
            <ForumJourneyList journeys={forumJourneys} />
          </div>
        </div>
      </div>
    </main>
  );
}

/** Griglia di card riutilizzata per Shop/Workshop/Consulenza: ognuna è un'offerta indipendente
 * creata dal creator, con il proprio prezzo, non inclusa nell'abbonamento sopra. Ogni card apre la
 * sua pagina di dettaglio pubblica e condivisibile (2026-09-26, richiesto da Manuel). Nessun
 * elemento = sezione invisibile (2026-10-03): mai più un riquadro "Nothing here yet".*/
function OfferingSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: OfferingCard[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <SectionTitle>{title}</SectionTitle>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>

      <div className={`mt-4 ${COMMUNITY_CARD_GRID}`}>
        {items.map((item) => (
          <ListingCard
            key={item.id}
            href={`/community/${item.type}/${item.id}`}
            coverUrl={item.coverUrl}
            icon={item.icon}
            chipLabel={item.chipLabel}
            title={item.title}
            footer={
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-bold text-ink">{item.price}</span>
                <span
                  title="Coming soon: payments aren't connected yet"
                  className="cursor-not-allowed rounded-full bg-surface-2 px-3.5 py-1.5 text-sm font-semibold text-ink-faint"
                >
                  {item.ctaLabel}
                </span>
              </div>
            }
          />
        ))}
      </div>
    </section>
  );
}
