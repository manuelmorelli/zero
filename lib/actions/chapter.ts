"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";

const ChapterSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters long.").max(100),
  description: z.string().trim().max(1000).optional(),
});

async function requireOwnedJourney(journeyId: string) {
  const { creator } = await requireCreator();
  const journey = await prisma.journey.findUnique({ where: { id: journeyId } });
  if (!journey || journey.creatorId !== creator.id) notFound();
  return journey;
}

async function requireOwnedChapter(chapterId: string) {
  const { creator } = await requireCreator();
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { journey: true },
  });
  if (!chapter || chapter.journey.creatorId !== creator.id) notFound();
  return chapter;
}

export async function createChapter(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const journeyId = formData.get("journeyId");
  if (typeof journeyId !== "string" || !journeyId) {
    return { error: "Invalid journey." };
  }
  const journey = await requireOwnedJourney(journeyId);

  const parsed = ChapterSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const lastChapter = await prisma.chapter.findFirst({
    where: { journeyId: journey.id, deletedAt: null },
    orderBy: { order: "desc" },
  });

  await prisma.chapter.create({
    data: {
      journeyId: journey.id,
      title: parsed.data.title,
      description: parsed.data.description,
      order: (lastChapter?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/dashboard/journeys/${journey.id}`);
  redirect(`/dashboard/journeys/${journey.id}`);
}

export async function updateChapter(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const chapterId = formData.get("chapterId");
  if (typeof chapterId !== "string" || !chapterId) {
    return { error: "Invalid chapter." };
  }
  const chapter = await requireOwnedChapter(chapterId);

  const parsed = ChapterSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  await prisma.chapter.update({
    where: { id: chapter.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
    },
  });

  revalidatePath(`/dashboard/journeys/${chapter.journeyId}`);
  redirect(`/dashboard/journeys/${chapter.journeyId}`);
}

export async function deleteChapter(formData: FormData): Promise<void> {
  const chapterId = formData.get("chapterId");
  if (typeof chapterId !== "string" || !chapterId) notFound();
  const chapter = await requireOwnedChapter(chapterId);

  await prisma.chapter.update({
    where: { id: chapter.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/dashboard/journeys/${chapter.journeyId}`);
  redirect(`/dashboard/journeys/${chapter.journeyId}`);
}

// Reorders by swapping `order` with the adjacent sibling. Simple by design: no
// batch reindexing, no drag & drop payload — just "move this one chapter by one position".
async function moveChapter(chapterId: string, direction: "up" | "down") {
  const chapter = await requireOwnedChapter(chapterId);

  const siblings = await prisma.chapter.findMany({
    where: { journeyId: chapter.journeyId, deletedAt: null },
    orderBy: { order: "asc" },
  });
  const index = siblings.findIndex((sibling) => sibling.id === chapter.id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  const target = siblings[targetIndex];

  if (target) {
    await prisma.$transaction([
      prisma.chapter.update({ where: { id: chapter.id }, data: { order: target.order } }),
      prisma.chapter.update({ where: { id: target.id }, data: { order: chapter.order } }),
    ]);
  }

  return chapter;
}

// Per il drag & drop: l'elemento può essere rilasciato più di una posizione più in
// là. Non introduce una nuova regola di riordino: ripete lo scambio con il vicino
// (la stessa funzione `moveChapter` sopra) una volta per ogni posizione da percorrere.
export async function moveChapterToIndex(chapterId: string, targetIndex: number): Promise<void> {
  const chapter = await requireOwnedChapter(chapterId);

  const siblings = await prisma.chapter.findMany({
    where: { journeyId: chapter.journeyId, deletedAt: null },
    orderBy: { order: "asc" },
  });
  const currentIndex = siblings.findIndex((sibling) => sibling.id === chapterId);
  if (currentIndex === -1) notFound();

  const clampedTarget = Math.max(0, Math.min(targetIndex, siblings.length - 1));
  const direction = clampedTarget > currentIndex ? "down" : "up";
  const steps = Math.abs(clampedTarget - currentIndex);

  for (let step = 0; step < steps; step++) {
    await moveChapter(chapterId, direction);
  }

  revalidatePath(`/dashboard/journeys/${chapter.journeyId}`);
}
