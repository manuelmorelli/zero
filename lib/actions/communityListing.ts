"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import {
  COMMUNITY_LISTING_TYPES,
  COMMUNITY_LISTING_LABELS,
  COMMUNITY_LISTING_NOTIFICATION_TYPE,
  MAX_LISTING_PRICE,
  listingSupportsFree,
  listingHasDate,
  listingHasFile,
  listingDetailPath,
  type CommunityListingType,
} from "@/lib/constants/communityListing";
import { notifyFollowersOfCommunityListing } from "@/lib/notifications";
import { ALLOWED_DIGITAL_PRODUCT_TYPES } from "@/lib/constants/file";
import { ALLOWED_IMAGE_TYPES } from "@/lib/constants/image";
import { copyImage, deleteFile, deleteImage, getFileUploadUrl, getImagePlaybackUrl, getImageUploadUrl, newFileKey, newImageKey } from "@/lib/r2";
import { isOwnAiImageKey } from "@/lib/ai/communityImage";
import { moderateImageUrl, moderateText, MODERATION_REJECTION_MESSAGE } from "@/lib/moderation";

// I quattro modelli (Workshop/Event/DigitalProduct/PersonalService) sono quasi identici ma restano
// tipi Prisma distinti: questo file li tratta in modo generico parametrizzato su `type` invece di
// duplicare 5 azioni x 4 volte. Il costo è un `any` isolato qui in getDelegate (mai altrove nel
// file): ogni chiamata che lo usa costruisce comunque un oggetto `data` verificato a mano subito
// prima, in base al `type` reale — vedi listingSupportsFree/listingHasDate/listingHasFile.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDelegate(type: CommunityListingType): any {
  switch (type) {
    case "workshop":
      return prisma.workshop;
    case "event":
      return prisma.event;
    case "digital_product":
      return prisma.digitalProduct;
    case "personal_service":
      return prisma.personalService;
  }
}

function isListingType(value: unknown): value is CommunityListingType {
  return typeof value === "string" && (COMMUNITY_LISTING_TYPES as readonly string[]).includes(value);
}

function parseListingRef(formData: FormData): { type: CommunityListingType; id: string } | null {
  const type = formData.get("listingType");
  const id = formData.get("listingId");
  if (!isListingType(type) || typeof id !== "string" || !id) return null;
  return { type, id };
}

async function requireOwnedListing(type: CommunityListingType, id: string) {
  const { creator } = await requireCreator();
  const listing = await getDelegate(type).findFirst({
    where: { id },
    include: { creator: { include: { user: true } } },
  });
  if (!listing || listing.creatorId !== creator.id || listing.deletedAt) notFound();
  return listing as {
    id: string;
    creatorId: string;
    title: string;
    description: string | null;
    price: unknown;
    isFree?: boolean;
    startsAt?: Date | null;
    fileUrl?: string | null;
    coverUrl?: string | null;
    status: "DRAFT" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
    deletedAt: Date | null;
    creator: { id: string; displayName: string; userId: string; user: { username: string | null } };
  };
}

/** La pagina "Community" del profilo (ex Subscribe, rinominata il 2026-09-26): qui vivono tutte le
 * sezioni riassuntive (Free events, Shop, Workshops & Events, Consulting), da rinfrescare quando un
 * elemento cambia stato. */
function communityPagePath(listing: { creator: { user: { username: string | null }; userId: string } }): string {
  const handle = listing.creator.user.username ?? listing.creator.userId;
  return `/profile/${handle}/community`;
}

const TitleDescriptionSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters long.").max(100),
  description: z.string().trim().max(2000).optional(),
});

function parsePrice(
  raw: FormDataEntryValue | null,
  isFree: boolean
): { price: number | null } | { error: string } {
  if (isFree) return { price: null };

  const value = Number(raw);
  if (!raw || !Number.isFinite(value) || value <= 0) {
    return { error: "Set a price, or mark it as free." };
  }
  if (value > MAX_LISTING_PRICE) {
    return { error: `Price can't be higher than ${MAX_LISTING_PRICE}.` };
  }
  return { price: Math.round(value * 100) / 100 };
}

function parseStartsAt(raw: FormDataEntryValue | null): Date | null {
  if (typeof raw !== "string" || !raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createCommunityListing(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { user, creator } = await requireCreator();

  const typeRaw = formData.get("type");
  if (!isListingType(typeRaw)) return { error: "Choose what you want to create." };
  const type = typeRaw;

  const parsed = TitleDescriptionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data." };

  const isFree = listingSupportsFree(type) && formData.get("isFree") === "on";
  const priceResult = parsePrice(formData.get("price"), isFree);
  if ("error" in priceResult) return { error: priceResult.error };

  const moderation = await moderateText(`${parsed.data.title}\n${parsed.data.description ?? ""}`);
  if (moderation.flagged) return { error: MODERATION_REJECTION_MESSAGE };

  const data: Record<string, unknown> = {
    creatorId: creator.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    price: priceResult.price,
  };
  if (listingSupportsFree(type)) data.isFree = isFree;
  if (listingHasDate(type)) data.startsAt = parseStartsAt(formData.get("startsAt"));

  // Alla creazione l'unica copertina possibile è un'immagine creata dall'AI nella chat ("Use as
  // cover"): le altre si caricano dopo, quando la bozza esiste già. Viene copiata sotto
  // community-covers, così cancellare la chat o la copertina non rompe l'altra.
  const coverKey = formData.get("coverKey");
  if (typeof coverKey === "string" && coverKey && isOwnAiImageKey(user.id, coverKey)) {
    const coverModeration = await moderateImageUrl(await getImagePlaybackUrl(coverKey));
    if (coverModeration.flagged) return { error: MODERATION_REJECTION_MESSAGE };
    data.coverUrl = await copyImage(coverKey, "community-covers");
  }

  const created = await getDelegate(type).create({ data });

  redirect(`/dashboard/community/${type}/${created.id}`);
}

export async function updateCommunityListing(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const ref = parseListingRef(formData);
  if (!ref) return { error: "Invalid listing." };
  const listing = await requireOwnedListing(ref.type, ref.id);

  const parsed = TitleDescriptionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data." };

  const isFree = listingSupportsFree(ref.type) && formData.get("isFree") === "on";
  const priceResult = parsePrice(formData.get("price"), isFree);
  if ("error" in priceResult) return { error: priceResult.error };

  const moderation = await moderateText(`${parsed.data.title}\n${parsed.data.description ?? ""}`);
  if (moderation.flagged) return { error: MODERATION_REJECTION_MESSAGE };

  const data: Record<string, unknown> = {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    price: priceResult.price,
  };
  if (listingSupportsFree(ref.type)) data.isFree = isFree;
  if (listingHasDate(ref.type)) data.startsAt = parseStartsAt(formData.get("startsAt"));

  const fileKey = formData.get("fileKey");
  if (listingHasFile(ref.type) && typeof fileKey === "string" && fileKey) {
    data.fileUrl = fileKey;
  }

  const coverKey = formData.get("coverKey");
  const newCoverKey = typeof coverKey === "string" && coverKey ? coverKey : null;
  const replacesCover = newCoverKey !== null && newCoverKey !== listing.coverUrl;

  if (replacesCover) {
    const coverPlaybackUrl = await getImagePlaybackUrl(newCoverKey);
    const coverModeration = await moderateImageUrl(coverPlaybackUrl);
    if (coverModeration.flagged) {
      await deleteImage(newCoverKey);
      return { error: MODERATION_REJECTION_MESSAGE };
    }
    data.coverUrl = newCoverKey;
  }

  await getDelegate(ref.type).update({ where: { id: listing.id }, data });

  // Il vecchio file/copertina resta orfano su R2 se non viene ripulito qui, stesso principio di
  // updateJourney per la copertina (lib/actions/journey.ts).
  if (listingHasFile(ref.type) && typeof fileKey === "string" && fileKey && listing.fileUrl && fileKey !== listing.fileUrl) {
    await deleteFile(listing.fileUrl);
  }
  if (replacesCover && listing.coverUrl) {
    await deleteImage(listing.coverUrl);
  }

  revalidatePath(`/dashboard/community/${ref.type}/${listing.id}`);
  redirect(`/dashboard/community/${ref.type}/${listing.id}`);
}

/** URL temporaneo per caricare il file di un Prodotto Digitale, dopo che la Bozza esiste già —
 * stesso schema in due passaggi già usato per la copertina del Journey (createJourneyCoverUploadUrl). */
export async function createCommunityListingFileUploadUrl(
  listingId: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string } | { error: string }> {
  await requireOwnedListing("digital_product", listingId);

  if (!ALLOWED_DIGITAL_PRODUCT_TYPES.has(contentType)) {
    return { error: "Unsupported file format (use PDF, ZIP or EPUB)." };
  }

  const key = newFileKey(contentType);
  const uploadUrl = await getFileUploadUrl(key, contentType);
  return { uploadUrl, key };
}

/** URL temporaneo per caricare la copertina di un Workshop/Evento/Prodotto/Consulenza, dopo che la
 * Bozza esiste già — stesso schema in due passaggi già usato per la copertina del Journey. Aggiunta
 * il 2026-09-26 dopo test reale di Manuel: creare un evento senza poter caricare una foto sembrava
 * incompleto. */
export async function createCommunityListingCoverUploadUrl(
  type: CommunityListingType,
  listingId: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string } | { error: string }> {
  await requireOwnedListing(type, listingId);

  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return { error: "Unsupported image format." };
  }

  const key = newImageKey("community-covers", contentType);
  const uploadUrl = await getImageUploadUrl(key, contentType);
  return { uploadUrl, key };
}

export async function publishCommunityListing(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const ref = parseListingRef(formData);
  if (!ref) return { error: "Invalid listing." };
  const listing = await requireOwnedListing(ref.type, ref.id);

  if (listing.status !== "DRAFT") return { error: "Only a Draft can be published." };

  const issues: string[] = [];
  if (!listing.isFree && listing.price === null) issues.push("a price, or mark it as free");
  if (listingHasDate(ref.type) && !listing.startsAt) issues.push("a date");
  if (listingHasFile(ref.type) && !listing.fileUrl) issues.push("the file to sell");
  if (issues.length > 0) return { error: `Before publishing, add: ${issues.join(", ")}.` };

  await getDelegate(ref.type).update({ where: { id: listing.id }, data: { status: "ACTIVE" } });

  revalidatePath("/dashboard/community");
  revalidatePath(`/dashboard/community/${ref.type}/${listing.id}`);
  revalidatePath(communityPagePath(listing));
  if (listingSupportsFree(ref.type) && listing.isFree) {
    revalidatePath(`/profile/${listing.creator.user.username ?? listing.creator.userId}`);
  }
  return { error: null };
}

export async function unpublishCommunityListing(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const ref = parseListingRef(formData);
  if (!ref) return { error: "Invalid listing." };
  const listing = await requireOwnedListing(ref.type, ref.id);

  if (listing.status !== "ACTIVE") return { error: "Only a published listing can be moved back to Draft." };

  await getDelegate(ref.type).update({ where: { id: listing.id }, data: { status: "DRAFT" } });

  revalidatePath("/dashboard/community");
  revalidatePath(`/dashboard/community/${ref.type}/${listing.id}`);
  revalidatePath(communityPagePath(listing));
  if (listingSupportsFree(ref.type) && listing.isFree) {
    revalidatePath(`/profile/${listing.creator.user.username ?? listing.creator.userId}`);
  }
  return { error: null };
}

export async function deleteCommunityListing(formData: FormData): Promise<void> {
  const ref = parseListingRef(formData);
  if (!ref) notFound();
  const listing = await requireOwnedListing(ref.type, ref.id);

  await getDelegate(ref.type).update({ where: { id: listing.id }, data: { deletedAt: new Date() } });
  if (listingHasFile(ref.type) && listing.fileUrl) await deleteFile(listing.fileUrl);

  revalidatePath("/dashboard/community");
  revalidatePath(communityPagePath(listing));
  if (listingSupportsFree(ref.type) && listing.isFree) {
    revalidatePath(`/profile/${listing.creator.user.username ?? listing.creator.userId}`);
  }
  redirect("/dashboard/community");
}

/** Pulsante "Notify your followers": mai automatico, sempre un click esplicito del creator (con
 * conferma nel dialog che lo richiama), come da regola di sicurezza già concordata con Manuel. */
export async function notifyFollowersOfListingAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const ref = parseListingRef(formData);
  if (!ref) return { error: "Invalid listing." };
  const listing = await requireOwnedListing(ref.type, ref.id);

  if (listing.status !== "ACTIVE") return { error: "Publish this first before notifying your followers." };

  await notifyFollowersOfCommunityListing({
    creatorId: listing.creatorId,
    creatorName: listing.creator.displayName,
    notificationType: COMMUNITY_LISTING_NOTIFICATION_TYPE[ref.type],
    listingLabel: COMMUNITY_LISTING_LABELS[ref.type],
    title: listing.title,
    link: listingDetailPath(ref.type, listing.id),
  });

  return { error: null };
}
