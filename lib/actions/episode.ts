"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";

const EpisodeSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters long.").max(100),
    caption: z.string().trim().max(10000).optional(),
    videoUrl: z.string().trim().url("That doesn't look like a valid video URL.").max(500).optional().or(z.literal("")),
    occurredAt: z
      .string()
      .trim()
      .min(1, "Let us know when this episode happened.")
      .pipe(z.coerce.date({ message: "Invalid date." })),
  })
  .refine((data) => data.caption || data.videoUrl, {
    message: "Add a caption or a video URL.",
    path: ["caption"],
  });

async function requireOwnedChapter(chapterId: string) {
  const { creator } = await requireCreator();
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { journey: true },
  });
  if (!chapter || chapter.journey.creatorId !== creator.id) notFound();
  return chapter;
}

async function requireOwnedEpisode(episodeId: string) {
  const { creator } = await requireCreator();
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: { chapter: { include: { journey: true } } },
  });
  if (!episode || episode.chapter.journey.creatorId !== creator.id) notFound();
  return episode;
}

export async function createEpisode(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const chapterId = formData.get("chapterId");
  if (typeof chapterId !== "string" || !chapterId) {
    return { error: "Invalid chapter." };
  }
  const chapter = await requireOwnedChapter(chapterId);

  const parsed = EpisodeSchema.safeParse({
    title: formData.get("title"),
    caption: formData.get("caption") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const lastEpisode = await prisma.episode.findFirst({
    where: { chapterId: chapter.id, deletedAt: null },
    orderBy: { order: "desc" },
  });

  await prisma.episode.create({
    data: {
      chapterId: chapter.id,
      title: parsed.data.title,
      caption: parsed.data.caption,
      videoUrl: parsed.data.videoUrl || undefined,
      occurredAt: parsed.data.occurredAt,
      order: (lastEpisode?.order ?? 0) + 1,
    },
  });

  // Il creator viene riportato alla pagina del Journey (non del capitolo) dopo la pubblicazione,
  // così ha un feedback visivo immediato che l'episodio è stato salvato.
  revalidatePath(`/dashboard/journeys/${chapter.journeyId}`);
  redirect(`/dashboard/journeys/${chapter.journeyId}`);
}

export async function updateEpisode(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const episodeId = formData.get("episodeId");
  if (typeof episodeId !== "string" || !episodeId) {
    return { error: "Invalid episode." };
  }
  const episode = await requireOwnedEpisode(episodeId);

  const parsed = EpisodeSchema.safeParse({
    title: formData.get("title"),
    caption: formData.get("caption") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  await prisma.episode.update({
    where: { id: episode.id },
    data: {
      title: parsed.data.title,
      caption: parsed.data.caption,
      videoUrl: parsed.data.videoUrl || null,
      occurredAt: parsed.data.occurredAt,
    },
  });

  revalidatePath(`/dashboard/journeys/${episode.chapter.journeyId}/chapters/${episode.chapterId}`);
  redirect(`/dashboard/journeys/${episode.chapter.journeyId}/chapters/${episode.chapterId}`);
}

export async function deleteEpisode(formData: FormData): Promise<void> {
  const episodeId = formData.get("episodeId");
  if (typeof episodeId !== "string" || !episodeId) notFound();
  const episode = await requireOwnedEpisode(episodeId);

  await prisma.episode.update({
    where: { id: episode.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/dashboard/journeys/${episode.chapter.journeyId}/chapters/${episode.chapterId}`);
  redirect(`/dashboard/journeys/${episode.chapter.journeyId}/chapters/${episode.chapterId}`);
}

// Reorders by swapping `order` with the adjacent sibling. Simple by design: no
// batch reindexing, no drag & drop payload — just "move this one episode by one position".
async function moveEpisode(episodeId: string, direction: "up" | "down") {
  const episode = await requireOwnedEpisode(episodeId);

  const siblings = await prisma.episode.findMany({
    where: { chapterId: episode.chapterId, deletedAt: null },
    orderBy: { order: "asc" },
  });
  const index = siblings.findIndex((sibling) => sibling.id === episode.id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  const target = siblings[targetIndex];

  if (target) {
    await prisma.$transaction([
      prisma.episode.update({ where: { id: episode.id }, data: { order: target.order } }),
      prisma.episode.update({ where: { id: target.id }, data: { order: episode.order } }),
    ]);
  }

  return episode;
}

// Per il drag & drop: l'elemento può essere rilasciato più di una posizione più in
// là. Non introduce una nuova regola di riordino: ripete lo scambio con il vicino
// (la stessa funzione `moveEpisode` sopra) una volta per ogni posizione da percorrere.
export async function moveEpisodeToIndex(episodeId: string, targetIndex: number): Promise<void> {
  const episode = await requireOwnedEpisode(episodeId);

  const siblings = await prisma.episode.findMany({
    where: { chapterId: episode.chapterId, deletedAt: null },
    orderBy: { order: "asc" },
  });
  const currentIndex = siblings.findIndex((sibling) => sibling.id === episodeId);
  if (currentIndex === -1) notFound();

  const clampedTarget = Math.max(0, Math.min(targetIndex, siblings.length - 1));
  const direction = clampedTarget > currentIndex ? "down" : "up";
  const steps = Math.abs(clampedTarget - currentIndex);

  for (let step = 0; step < steps; step++) {
    await moveEpisode(episodeId, direction);
  }

  revalidatePath(`/dashboard/journeys/${episode.chapter.journeyId}/chapters/${episode.chapterId}`);
}
