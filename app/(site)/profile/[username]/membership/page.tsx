import { notFound } from "next/navigation";
import {
  Check,
  FileText,
  Lock,
  Map,
  MapPin,
  MessageCircle,
  Play,
  Video,
  type LucideIcon,
} from "lucide-react";
import { findUserByUsernameOrId } from "@/lib/profile/findUserByUsernameOrId";
import { getImagePlaybackUrl } from "@/lib/r2";
import { FadeImage } from "@/components/common/FadeImage";
import { prisma } from "@/lib/prisma";

/** Bozza visiva (nessun pagamento reale): Punto 7 dell'allineamento, "Struttura pagine Creator
 * Economy". Un solo livello di abbonamento mensile per l'intero profilo del creator (non per
 * singolo Journey, deciso con Manuel il 2026-09-22), che sbloccherebbe materiale pratico extra
 * (video, documenti, mappe) slegato da Journey/Episodi/Update, che restano sempre gratis.
 *
 * Aggiornamento 2026-09-22: "Subscribe" è ora l'unico punto di ingresso della Creator Economy sul
 * profilo (prima erano quattro pulsanti separati). Iscriversi sblocca l'accesso a questa pagina,
 * ma Shop/Workshop/Consulenza restano ognuno con il proprio prezzo a parte, non inclusi
 * nell'abbonamento: sono le "card cliccabili" che il creator crea in base a ciò che offre. */
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
  title: string;
  description: string;
  meta: string;
  price: string;
  ctaLabel: string;
};

/** Punto 8 dell'allineamento (2026-09-25): queste tre vetrine mostravano dati finti, sostituiti
 * con Workshop/Event a pagamento, Prodotto Digitale e Consulenza 1:1 reali (creati dalla pagina
 * Dashboard > Community). I Workshop/Eventi gratuiti non compaiono qui: sono contenuto pubblico
 * mostrato direttamente sul profilo (vedi FreeEventsSection), non un'offerta a pagamento. */
function formatEventMeta(startsAt: Date | null): string {
  if (!startsAt) return "Date to be announced";
  return startsAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatPrice(price: unknown): string {
  return `€${Number(price)}`;
}

export default async function MembershipPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await findUserByUsernameOrId(username);
  if (!user || user.deletedAt) notFound();

  const avatarUrl = user.avatarUrl ? await getImagePlaybackUrl(user.avatarUrl) : null;

  const creator = await prisma.creator.findUnique({ where: { userId: user.id } });

  const [paidWorkshops, paidEvents, digitalProducts, personalServices] = creator
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
      ])
    : [[], [], [], []];

  const shopItems: OfferingCard[] = digitalProducts.map((item) => ({
    icon: FileText,
    title: item.title,
    description: item.description ?? "",
    meta: "Digital product",
    price: formatPrice(item.price),
    ctaLabel: "Buy",
  }));

  const workshopsAndEvents: OfferingCard[] = [
    ...paidWorkshops.map((item) => ({
      icon: Video,
      title: item.title,
      description: item.description ?? "",
      meta: `Workshop · ${formatEventMeta(item.startsAt)}`,
      price: formatPrice(item.price),
      ctaLabel: "Reserve",
    })),
    ...paidEvents.map((item) => ({
      icon: MapPin,
      title: item.title,
      description: item.description ?? "",
      meta: `Event · ${formatEventMeta(item.startsAt)}`,
      price: formatPrice(item.price),
      ctaLabel: "Reserve",
    })),
  ];

  const consultingSessions: OfferingCard[] = personalServices.map((item) => ({
    icon: MessageCircle,
    title: item.title,
    description: item.description ?? "",
    meta: "1:1 Service",
    price: formatPrice(item.price),
    ctaLabel: "Book a call",
  }));

  return (
    <main>
      <div className="mx-auto w-full max-w-4xl px-5 pb-16 pt-24">
        <section className="rounded-2xl border border-ember/20 bg-gradient-to-b from-ember/8 to-white/[0.02] p-6 backdrop-blur-md sm:p-8">
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
                  <h1 className="truncate text-lg font-bold tracking-tight text-ink">{user.name}</h1>
                  <p className="truncate text-sm text-ink-muted">@{user.username ?? username}</p>
                </div>
              </div>

              <p className="mt-5 max-w-[48ch] text-sm leading-relaxed text-ink-muted">
                Support {user.name.split(" ")[0]} and unlock extra material published only for members: bonus
                videos, downloadable documents and practical guides.
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
                <p className="mt-1 text-xs text-ink-muted">Cancel anytime.</p>
              </div>
              <button
                type="button"
                disabled
                title="Coming soon: payments aren't connected yet"
                className="cursor-not-allowed rounded-full bg-surface-2 px-5 py-2.5 text-sm font-semibold text-ink-faint"
              >
                Subscribe — Coming soon
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-base font-bold tracking-tight text-ink">What&apos;s inside</h2>
          <p className="mt-1 text-sm text-ink-muted">A preview of what members unlock.</p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {insideItems.map((item) => (
              <div key={item.title} className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="relative flex aspect-video items-center justify-center border-b border-border bg-surface-2">
                  {item.kind === "video" && <Play className="h-8 w-8 text-ink-faint" aria-hidden="true" />}
                  {item.kind === "document" && <FileText className="h-8 w-8 text-ink-faint" aria-hidden="true" />}
                  {item.kind === "map" && <Map className="h-8 w-8 text-ink-faint" aria-hidden="true" />}
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-ink-muted">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    Locked
                  </span>
                </div>
                <div className="p-3.5">
                  <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{item.meta}</p>
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
    </main>
  );
}

/** Griglia di card riutilizzata per Shop/Workshop/Consulenza: ognuna è un'offerta indipendente
 * creata dal creator, con il proprio prezzo, non inclusa nell'abbonamento sopra. */
function OfferingSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: OfferingCard[];
}) {
  return (
    <section className="mt-10">
      <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>

      {items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-muted">
          Nothing here yet.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
                <div className="flex aspect-video items-center justify-center border-b border-border bg-surface-2">
                  <Icon className="h-8 w-8 text-ink-faint" aria-hidden="true" />
                </div>
                <div className="flex flex-1 flex-col p-3.5">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-faint">{item.meta}</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-ink">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">{item.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <span className="text-base font-bold text-ink">{item.price}</span>
                    <button
                      type="button"
                      disabled
                      title="Coming soon: payments aren't connected yet"
                      className="cursor-not-allowed rounded-full bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-ink-faint"
                    >
                      {item.ctaLabel}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
