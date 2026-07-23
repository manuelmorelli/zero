"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { JOURNEY_CATEGORIES } from "@/lib/constants/categories";

async function requireOwnedJourney(journeyId: string) {
  const { creator } = await requireCreator();
  const journey = await prisma.journey.findUnique({ where: { id: journeyId } });
  if (!journey || journey.creatorId !== creator.id) notFound();
  return journey;
}

const JourneySchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters long.").max(100),
  description: z.string().trim().max(2000).optional(),
  category: z.enum(JOURNEY_CATEGORIES).optional(),
  tags: z.string().trim().max(200).optional(),
});

function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export async function createJourney(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { creator } = await requireCreator();

  const activeJourney = await prisma.journey.findFirst({
    where: { creatorId: creator.id, status: { not: "ARCHIVED" } },
  });
  if (activeJourney) {
    return {
      error:
        "You already have an active Journey. Archive it before creating a new one.",
    };
  }

  const parsed = JourneySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const journey = await prisma.journey.create({
    data: {
      creatorId: creator.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      tags: parseTags(parsed.data.tags),
    },
  });

  redirect(`/dashboard/journeys/${journey.id}`);
}

export async function updateJourney(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const journeyId = formData.get("journeyId");
  if (typeof journeyId !== "string" || !journeyId) {
    return { error: "Invalid journey." };
  }
  const journey = await requireOwnedJourney(journeyId);

  const parsed = JourneySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  await prisma.journey.update({
    where: { id: journey.id },
    data: {
      title: parsed.data.title,
      // Explicitly null (not undefined) so clearing a field in the form clears it in the database too —
      // Prisma treats `undefined` as "leave unchanged" on update, unlike on create.
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? null,
      tags: parseTags(parsed.data.tags),
    },
  });

  revalidatePath(`/dashboard/journeys/${journey.id}`);
  redirect(`/dashboard/journeys/${journey.id}`);
}

export async function publishJourney(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const journeyId = formData.get("journeyId");
  if (typeof journeyId !== "string" || !journeyId) {
    return { error: "Invalid journey." };
  }
  const journey = await requireOwnedJourney(journeyId);

  if (journey.status !== "DRAFT") {
    return { error: "Only a Draft Journey can be published." };
  }

  const issues: string[] = [];
  if (!journey.description || journey.description.trim().length === 0) {
    issues.push("a Presentation");
  }
  const episodeCount = await prisma.episode.count({
    where: { deletedAt: null, chapter: { deletedAt: null, journeyId: journey.id } },
  });
  if (episodeCount === 0) {
    issues.push("at least one Episode");
  }
  if (issues.length > 0) {
    return { error: `Before publishing, add: ${issues.join(", ")}.` };
  }

  await prisma.journey.update({
    where: { id: journey.id },
    data: { status: "PUBLISHED" },
  });

  revalidatePath(`/dashboard/journeys/${journey.id}`);
  revalidatePath(`/journeys/${journey.id}`);
  return { error: null };
}

export async function unpublishJourney(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const journeyId = formData.get("journeyId");
  if (typeof journeyId !== "string" || !journeyId) {
    return { error: "Invalid journey." };
  }
  const journey = await requireOwnedJourney(journeyId);

  if (journey.status !== "PUBLISHED") {
    return { error: "Only a published Journey can be moved back to Draft." };
  }

  await prisma.journey.update({
    where: { id: journey.id },
    data: { status: "DRAFT" },
  });

  revalidatePath(`/dashboard/journeys/${journey.id}`);
  revalidatePath(`/journeys/${journey.id}`);
  return { error: null };
}
