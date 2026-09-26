import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getViewerSession } from "@/lib/session";
import { getImagePlaybackUrl } from "@/lib/r2";
import {
  COMMUNITY_LISTING_LABELS,
  COMMUNITY_LISTING_TYPES,
  type CommunityListingType,
} from "@/lib/constants/communityListing";
import { RsvpButton } from "@/components/profile/RsvpButton";
import { ShareButton } from "@/components/common/ShareButton";

function isListingType(value: string): value is CommunityListingType {
  return (COMMUNITY_LISTING_TYPES as readonly string[]).includes(value);
}

function findPublicListing(type: CommunityListingType, id: string, viewerUserId: string | null) {
  const rsvpInclude = viewerUserId ? { where: { userId: viewerUserId }, select: { id: true } } : false;
  switch (type) {
    case "workshop":
      return prisma.workshop.findUnique({
        where: { id },
        include: { creator: { include: { user: true } }, _count: { select: { rsvps: true } }, rsvps: rsvpInclude },
      });
    case "event":
      return prisma.event.findUnique({
        where: { id },
        include: { creator: { include: { user: true } }, _count: { select: { rsvps: true } }, rsvps: rsvpInclude },
      });
    case "digital_product":
      return prisma.digitalProduct.findUnique({ where: { id }, include: { creator: { include: { user: true } } } });
    case "personal_service":
      return prisma.personalService.findUnique({ where: { id }, include: { creator: { include: { user: true } } } });
  }
}

/**
 * Pagina pubblica e condivisibile di un singolo Workshop/Evento/Prodotto/Consulenza (2026-09-26,
 * richiesta da Manuel dopo aver testato: le notifiche portavano a una pagina generica dove
 * l'elemento non si trovava facilmente, e le card non si potevano aprire per vedere i dettagli).
 */
export default async function CommunityListingDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type: typeParam, id } = await params;
  if (!isListingType(typeParam)) notFound();
  const type = typeParam;

  const session = await getViewerSession();
  const listing = await findPublicListing(type, id, session?.user.id ?? null);
  if (!listing || listing.deletedAt || listing.status !== "ACTIVE") notFound();

  const coverKey = "coverUrl" in listing ? listing.coverUrl : null;
  const coverUrl = coverKey ? await getImagePlaybackUrl(coverKey) : null;

  const isFree = "isFree" in listing ? Boolean(listing.isFree) : false;
  const startsAt = "startsAt" in listing && listing.startsAt ? listing.startsAt : null;
  const rsvpCount = "_count" in listing ? listing._count.rsvps : 0;
  const going = "rsvps" in listing && Array.isArray(listing.rsvps) && listing.rsvps.length > 0;

  const handle = listing.creator.user.username ?? listing.creator.userId;

  return (
    <main>
      <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-24">
        <Link href={`/profile/${handle}/community`} className="text-xs font-semibold text-ink-muted transition-colors hover:text-ink">
          ← {listing.creator.displayName}&apos;s Community
        </Link>

        <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-surface-2">
          {coverUrl ? (
            <Image src={coverUrl} alt={listing.title} fill sizes="(min-width: 768px) 672px, 100vw" className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-2 to-black" />
          )}
          {isFree && (
            <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Free
            </span>
          )}
        </div>

        <div className="mt-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ember">
              {COMMUNITY_LISTING_LABELS[type]}
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-ink">{listing.title}</h1>
          </div>
          <ShareButton
            path={`/community/${type}/${id}`}
            label={listing.title}
            updateCaption={`Check out ${listing.creator.displayName}'s ${COMMUNITY_LISTING_LABELS[type]}: ${listing.title}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
          />
        </div>

        {startsAt && (
          <p className="mt-2 text-sm text-ink-muted">
            {startsAt.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
          </p>
        )}

        {listing.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-muted">{listing.description}</p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
          {isFree ? (
            <>
              <span className="text-sm text-ink-muted">
                {rsvpCount} {rsvpCount === 1 ? "person" : "people"} going
              </span>
              <RsvpButton kind={type === "event" ? "event" : "workshop"} id={id} initialGoing={going} isLoggedIn={Boolean(session)} />
            </>
          ) : (
            <>
              <span className="text-xl font-bold text-ink">€{Number(listing.price)}</span>
              <button
                type="button"
                disabled
                title="Coming soon: payments aren't connected yet"
                className="cursor-not-allowed rounded-full bg-surface-2 px-5 py-2.5 text-sm font-semibold text-ink-faint"
              >
                Coming soon
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
