"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const CreatorProfileSchema = z.object({
  displayName: z.string().trim().min(2, "Il nome deve avere almeno 2 caratteri.").max(60),
  description: z.string().trim().max(500).optional(),
});

export async function createCreatorProfile(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  const existing = await prisma.creator.findUnique({ where: { userId: user.id } });
  if (existing) redirect("/creator");

  const parsed = CreatorProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  await prisma.creator.create({
    data: {
      userId: user.id,
      displayName: parsed.data.displayName,
      description: parsed.data.description,
    },
  });

  redirect("/creator");
}
