"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { JOURNEY_CATEGORIES } from "@/lib/constants/categories";

const InterestsSchema = z
  .array(z.enum(JOURNEY_CATEGORIES))
  .min(1, "Pick at least one interest to continue.");

export async function saveOnboardingInterests(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  const parsed = InterestsSchema.safeParse(formData.getAll("interests"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { interests: parsed.data },
  });

  redirect("/");
}
