"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";

const JourneySchema = z.object({
  title: z.string().trim().min(2, "Il titolo deve avere almeno 2 caratteri.").max(100),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(40).optional(),
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
        "Hai già un Journey attivo. Archivialo prima di crearne uno nuovo.",
    };
  }

  const parsed = JourneySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
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

  redirect(`/creator/journeys/${journey.id}`);
}
