"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { deleteExpiredUpdates, UPDATE_LIFETIME_MS } from "@/lib/updates";

const UpdateSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write something first.")
    .max(500, "Keep it under 500 characters."),
});

export async function createUpdate(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { creator } = await requireCreator();

  const parsed = UpdateSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid content." };
  }

  await deleteExpiredUpdates();

  const publishedAt = new Date();
  await prisma.update.create({
    data: {
      creatorId: creator.id,
      type: "TEXT",
      content: parsed.data.content,
      publishedAt,
      archivedAt: new Date(publishedAt.getTime() + UPDATE_LIFETIME_MS),
    },
  });

  revalidatePath("/dashboard");
  return { error: null };
}

// Rimozione anticipata da parte del creator: elimina subito la riga invece di aspettare
// che la pulizia lazy la trovi scaduta, stessa tabella "updates", nessun campo aggiuntivo.
export async function archiveUpdate(formData: FormData): Promise<void> {
  const updateId = formData.get("updateId");
  if (typeof updateId !== "string" || !updateId) notFound();

  const { creator } = await requireCreator();
  const update = await prisma.update.findUnique({ where: { id: updateId } });
  if (!update || update.creatorId !== creator.id) notFound();

  await prisma.update.delete({ where: { id: update.id } });
  revalidatePath("/dashboard");
}
