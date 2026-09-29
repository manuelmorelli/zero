import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { getImagePlaybackUrl } from "@/lib/r2";
import {
  COMMUNITY_LISTING_LABELS,
  COMMUNITY_LISTING_TYPES,
  type CommunityListingType,
} from "@/lib/constants/communityListing";
import { CommunityListingForm } from "@/components/creator/CommunityListingForm";
import { CommunityListingStatusControl } from "@/components/creator/CommunityListingStatusControl";
import { PageTitle } from "@/components/ui/heading";

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

  const coverKey = "coverUrl" in listing ? (listing.coverUrl as string | null) : null;
  const coverPreviewUrl = coverKey ? await getImagePlaybackUrl(coverKey) : null;

  return (
    <main>
      <div className="mx-auto w-full max-w-lg px-6 pb-16 pt-24">
        <p className="text-sm uppercase tracking-[0.18em] text-ember">{COMMUNITY_LISTING_LABELS[type]}</p>
        <PageTitle>{listing.title}</PageTitle>

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
              location: "location" in listing ? (listing.location as string | null) : null,
              fileUrl: "fileUrl" in listing ? (listing.fileUrl as string | null) : null,
              coverUrl: coverPreviewUrl,
            }}
          />
        </div>
      </div>
    </main>
  );
}
