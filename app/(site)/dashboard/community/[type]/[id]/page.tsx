import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import {
  COMMUNITY_LISTING_LABELS,
  COMMUNITY_LISTING_TYPES,
  type CommunityListingType,
} from "@/lib/constants/communityListing";
import { CommunityListingForm } from "@/components/creator/CommunityListingForm";
import { CommunityListingStatusControl } from "@/components/creator/CommunityListingStatusControl";

function isListingType(value: string): value is CommunityListingType {
  return (COMMUNITY_LISTING_TYPES as readonly string[]).includes(value);
}

function findListing(type: CommunityListingType, id: string) {
  switch (type) {
    case "workshop":
      return prisma.workshop.findUnique({ where: { id } });
    case "event":
      return prisma.event.findUnique({ where: { id } });
    case "digital_product":
      return prisma.digitalProduct.findUnique({ where: { id } });
    case "personal_service":
      return prisma.personalService.findUnique({ where: { id } });
  }
}

export default async function EditCommunityListingPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type: typeParam, id } = await params;
  if (!isListingType(typeParam)) notFound();
  const type = typeParam;

  const { creator } = await requireCreator();
  const listing = await findListing(type, id);
  if (!listing || listing.creatorId !== creator.id || listing.deletedAt) notFound();

  return (
    <main>
      <div className="mx-auto w-full max-w-lg px-6 pb-16 pt-24">
        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-ember">{COMMUNITY_LISTING_LABELS[type]}</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight">{listing.title}</h1>

        <div className="mt-6">
          <CommunityListingStatusControl
            listingId={listing.id}
            listingType={type}
            title={listing.title}
            status={listing.status}
          />
        </div>

        <div className="mt-8">
          <CommunityListingForm
            type={type}
            listing={{
              id: listing.id,
              title: listing.title,
              description: listing.description,
              isFree: "isFree" in listing ? Boolean(listing.isFree) : false,
              price: listing.price === null ? null : Number(listing.price),
              startsAt: "startsAt" in listing && listing.startsAt ? listing.startsAt.toISOString() : null,
              fileUrl: "fileUrl" in listing ? (listing.fileUrl as string | null) : null,
            }}
          />
        </div>
      </div>
    </main>
  );
}
