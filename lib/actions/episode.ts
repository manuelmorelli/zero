"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";

const EpisodeSchema = z
  .object({
    title: z.string().trim().min(2, "Il titolo deve avere almeno 2 caratteri.").max(100),
    description: z.string().trim().max(1000).optional(),
    text: z.string().trim().max(10000).optional(),
    videoUrl: z.string().trim().url("Il link del video non è valido.").max(500).optional().or(z.literal("")),
    occurredAt: z
      .string()
      .trim()
      .min(1, "Indica quando è successo questo episodio.")
      .pipe(z.coerce.date({ message: "Data non valida." })),
  })
  .refine((data) => data.text || data.videoUrl, {
    message: "Aggiungi almeno un testo o un link video.",
    path: ["text"],
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
    return { error: "Capitolo non valido." };
  }
  const chapter = await requireOwnedChapter(chapterId);

  const parsed = EpisodeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    text: formData.get("text") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const lastEpisode = await prisma.episode.findFirst({
    where: { chapterId: chapter.id, deletedAt: null },
    orderBy: { order: "desc" },
  });

  await prisma.episode.create({
    data: {
      chapterId: chapter.id,
      title: parsed.data.title,
      description: parsed.data.description,
      text: parsed.data.text,
      videoUrl: parsed.data.videoUrl || undefined,
      occurredAt: parsed.data.occurredAt,
      order: (lastEpisode?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/creator/journeys/${chapter.journeyId}/chapters/${chapter.id}`);
  redirect(`/creator/journeys/${chapter.journeyId}/chapters/${chapter.id}`);
}

export async function updateEpisode(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const episodeId = formData.get("episodeId");
  if (typeof episodeId !== "string" || !episodeId) {
    return { error: "Episodio non valido." };
  }
  const episode = await requireOwnedEpisode(episodeId);

  const parsed = EpisodeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    text: formData.get("text") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  await prisma.episode.update({
    where: { id: episode.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      text: parsed.data.text,
      videoUrl: parsed.data.videoUrl || null,
      occurredAt: parsed.data.occurredAt,
    },
  });

  revalidatePath(`/creator/journeys/${episode.chapter.journeyId}/chapters/${episode.chapterId}`);
  redirect(`/creator/journeys/${episode.chapter.journeyId}/chapters/${episode.chapterId}`);
}

export async function deleteEpisode(formData: FormData): Promise<void> {
  const episodeId = formData.get("episodeId");
  if (typeof episodeId !== "string" || !episodeId) notFound();
  const episode = await requireOwnedEpisode(episodeId);

  await prisma.episode.update({
    where: { id: episode.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/creator/journeys/${episode.chapter.journeyId}/chapters/${episode.chapterId}`);
  redirect(`/creator/journeys/${episode.chapter.journeyId}/chapters/${episode.chapterId}`);
}
