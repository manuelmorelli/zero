"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { JOURNEY_CATEGORIES } from "@/lib/constants/categories";

const AccountSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long.").max(100),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_-]{3,30}$/, "Username must be 3-30 characters: lowercase letters, numbers, - or _.")
    .optional(),
  bio: z.string().trim().max(280, "Bio must be at most 280 characters long.").optional(),
  interests: z.array(z.enum(JOURNEY_CATEGORIES)).min(1, "Pick at least one interest."),
});

export async function updateAccount(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  const parsed = AccountSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username") || undefined,
    bio: formData.get("bio") || undefined,
    interests: formData.getAll("interests"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        username: parsed.data.username ?? null,
        bio: parsed.data.bio ?? null,
        interests: parsed.data.interests,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "This username is already taken." };
    }
    throw error;
  }

  revalidatePath("/account");
  return { error: null };
}
