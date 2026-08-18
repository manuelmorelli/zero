"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";
import { getCurrentSession } from "@/lib/session";
import { deleteExpiredUpdates, UPDATE_LIFETIME_MS } from "@/lib/updates";
import {
  deleteImage,
  deleteVideo,
  getImageUploadUrl,
  getVideoSize,
  getVideoUploadUrl,
  newImageKey,
  newVideoKey,
} from "@/lib/r2";
import { ALLOWED_IMAGE_TYPES } from "@/lib/constants/image";
import { ALLOWED_VIDEO_TYPES, MAX_UPDATE_VIDEO_SIZE_BYTES } from "@/lib/constants/video";
import {
  POLL_MAX_OPTIONS,
  POLL_MIN_OPTIONS,
  POLL_OPTION_MAX_LENGTH,
  REACTION_EMOJIS,
  UPDATE_ANSWER_MAX_LENGTH,
  UPDATE_TEXT_MAX_LENGTH,
} from "@/lib/constants/updates";
import type { UpdateType } from "@/generated/prisma/client";

const UpdateSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write something first.")
    .max(UPDATE_TEXT_MAX_LENGTH, "Keep it under 500 characters."),
});

// Testo semplice pubblicato dalla Dashboard (casella rapida): resta com'era, il percorso più
// ricco (foto/video/sondaggio/domanda/link) vive solo nel pulsante "+" globale (publishUpdate qui sotto).
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
  // Nessuna riga referenzia più il file: va ripulito qui, non lo fa il cascade del database.
  if (update.mediaKey) {
    await (update.type === "VIDEO" ? deleteVideo(update.mediaKey) : deleteImage(update.mediaKey));
  }

  revalidatePath("/dashboard");
}

/* ------------------------------------------------------------------ */
/* PULSANTE "+" — PUBBLICAZIONE UPDATE RICCO (TESTO/FOTO/VIDEO/SONDAGGIO/DOMANDA) */
/* ------------------------------------------------------------------ */

// Genera l'URL temporaneo con cui il browser carica il file direttamente su R2, stesso principio
// già in uso per il video degli episodi (createEpisodeVideoUploadUrl in lib/actions/episode.ts).
export async function createUpdateMediaUploadUrl(
  kind: "image" | "video",
  contentType: string
): Promise<{ uploadUrl: string; key: string } | { error: string }> {
  await requireCreator();

  if (kind === "image") {
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) return { error: "Unsupported image format." };
    const key = newImageKey("updates", contentType);
    const uploadUrl = await getImageUploadUrl(key, contentType);
    return { uploadUrl, key };
  }

  if (!ALLOWED_VIDEO_TYPES.has(contentType)) return { error: "Unsupported video format." };
  const key = newVideoKey(contentType, "updates");
  const uploadUrl = await getVideoUploadUrl(key, contentType);
  return { uploadUrl, key };
}

async function assertOwnedJourney(creatorId: string, journeyId: string): Promise<void> {
  const journey = await prisma.journey.findUnique({ where: { id: journeyId } });
  if (!journey || journey.creatorId !== creatorId) notFound();
}

async function assertOwnedEpisode(creatorId: string, episodeId: string): Promise<void> {
  const episode = await prisma.episode.findUnique({ where: { id: episodeId }, include: { journey: true } });
  if (!episode || episode.journey.creatorId !== creatorId) notFound();
}

function optionalField(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value ? value : null;
}

export type PublishUpdateState = { error: string | null; done: boolean };

export async function publishUpdate(
  _prevState: PublishUpdateState,
  formData: FormData
): Promise<PublishUpdateState> {
  const { creator } = await requireCreator();

  const rawType = formData.get("type");
  if (
    typeof rawType !== "string" ||
    !["TEXT", "IMAGE", "VIDEO", "POLL", "QUESTION"].includes(rawType)
  ) {
    return { error: "Invalid update type.", done: false };
  }
  const type = rawType as UpdateType;

  const content = (formData.get("content") ?? "").toString().trim();
  let mediaKey: string | null = null;
  let pollOptionLabels: string[] = [];

  if (type === "TEXT") {
    if (!content) return { error: "Write something first.", done: false };
    if (content.length > UPDATE_TEXT_MAX_LENGTH) return { error: "Keep it under 500 characters.", done: false };
  }

  if (type === "QUESTION") {
    if (!content) return { error: "Write a question first.", done: false };
    if (content.length > UPDATE_TEXT_MAX_LENGTH) return { error: "Keep it under 500 characters.", done: false };
  }

  if (type === "IMAGE" || type === "VIDEO") {
    const rawMediaKey = formData.get("mediaKey");
    if (typeof rawMediaKey !== "string" || !rawMediaKey) {
      return { error: type === "IMAGE" ? "Upload a photo first." : "Upload a video first.", done: false };
    }
    mediaKey = rawMediaKey;
    if (content.length > UPDATE_TEXT_MAX_LENGTH) {
      return { error: "Keep the caption under 500 characters.", done: false };
    }
    if (type === "VIDEO") {
      // Non ci si fida della dimensione dichiarata dal browser (stesso principio già in uso per
      // gli episodi): si verifica il file effettivamente arrivato su R2.
      const size = await getVideoSize(mediaKey);
      if (size === null) {
        return { error: "Video upload not found. Please try uploading again.", done: false };
      }
      if (size > MAX_UPDATE_VIDEO_SIZE_BYTES) {
        await deleteVideo(mediaKey);
        return { error: "Video is too large (max 100MB).", done: false };
      }
    }
  }

  if (type === "POLL") {
    if (!content) return { error: "Write a question first.", done: false };
    if (content.length > UPDATE_TEXT_MAX_LENGTH) return { error: "Keep it under 500 characters.", done: false };

    pollOptionLabels = formData
      .getAll("pollOption")
      .map((value) => value.toString().trim())
      .filter((value) => value.length > 0);

    if (pollOptionLabels.length < POLL_MIN_OPTIONS) {
      return { error: `Add at least ${POLL_MIN_OPTIONS} options.`, done: false };
    }
    if (pollOptionLabels.length > POLL_MAX_OPTIONS) {
      return { error: `Up to ${POLL_MAX_OPTIONS} options.`, done: false };
    }
    if (pollOptionLabels.some((label) => label.length > POLL_OPTION_MAX_LENGTH)) {
      return { error: "Keep each option short.", done: false };
    }
  }

  const linkedJourneyId = optionalField(formData.get("linkedJourneyId"));
  const linkedEpisodeId = optionalField(formData.get("linkedEpisodeId"));
  if (linkedJourneyId) await assertOwnedJourney(creator.id, linkedJourneyId);
  if (linkedEpisodeId) await assertOwnedEpisode(creator.id, linkedEpisodeId);

  await deleteExpiredUpdates();

  const publishedAt = new Date();
  await prisma.update.create({
    data: {
      creatorId: creator.id,
      type,
      content,
      mediaKey,
      linkedJourneyId,
      linkedEpisodeId,
      publishedAt,
      archivedAt: new Date(publishedAt.getTime() + UPDATE_LIFETIME_MS),
      ...(pollOptionLabels.length > 0
        ? { pollOptions: { create: pollOptionLabels.map((label, index) => ({ label, order: index })) } }
        : {}),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
  return { error: null, done: true };
}

/* ------------------------------------------------------------------ */
/* VISUALIZZATORE STORIES — voto, risposta, reazione, "visto"          */
/* ------------------------------------------------------------------ */

export async function voteOnPoll(
  updateId: string,
  optionId: string
): Promise<{ error: string | null }> {
  const session = await getCurrentSession();
  if (!session) return { error: "You need to sign in to vote." };

  const update = await prisma.update.findUnique({ where: { id: updateId } });
  if (!update || update.type !== "POLL") return { error: "Poll not found." };
  if (update.archivedAt && update.archivedAt <= new Date()) return { error: "This poll has expired." };

  const option = await prisma.pollOption.findUnique({ where: { id: optionId } });
  if (!option || option.updateId !== updateId) return { error: "Option not found." };

  const existing = await prisma.updateVote.findUnique({
    where: { updateId_userId: { updateId, userId: session.user.id } },
  });
  // Voto singolo, non modificabile dopo (decisione presa con Manuel): un secondo tentativo
  // è respinto invece di sostituire il voto precedente.
  if (existing) return { error: "You've already voted." };

  await prisma.updateVote.create({ data: { updateId, optionId, userId: session.user.id } });
  return { error: null };
}

export async function submitAnswer(
  updateId: string,
  content: string
): Promise<{ error: string | null }> {
  const session = await getCurrentSession();
  if (!session) return { error: "You need to sign in to answer." };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Write an answer first." };
  if (trimmed.length > UPDATE_ANSWER_MAX_LENGTH) return { error: "Keep it under 500 characters." };

  const update = await prisma.update.findUnique({ where: { id: updateId } });
  if (!update || update.type !== "QUESTION") return { error: "Question not found." };

  const existing = await prisma.updateAnswer.findUnique({
    where: { updateId_userId: { updateId, userId: session.user.id } },
  });
  // Una risposta a testa: le risposte sono private, visibili solo al creator (bassa pressione,
  // nessuna "gara" di risposte), quindi non ha senso lasciarne inviare più di una.
  if (existing) return { error: "You already answered this." };

  await prisma.updateAnswer.create({ data: { updateId, userId: session.user.id, content: trimmed } });
  return { error: null };
}

type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

// Un tocco per persona per Update: un secondo tocco sulla stessa emoji la toglie (come un
// "mi piace" a interruttore), un tocco su un'emoji diversa la sostituisce.
export async function reactToUpdate(
  updateId: string,
  emoji: string
): Promise<{ error: string | null; reaction?: string | null }> {
  const session = await getCurrentSession();
  if (!session) return { error: "You need to sign in to react." };
  if (!REACTION_EMOJIS.includes(emoji as ReactionEmoji)) return { error: "Invalid reaction." };

  const update = await prisma.update.findUnique({ where: { id: updateId } });
  if (!update) return { error: "Update not found." };

  const existing = await prisma.updateReaction.findUnique({
    where: { updateId_userId: { updateId, userId: session.user.id } },
  });

  if (existing && existing.emoji === emoji) {
    await prisma.updateReaction.delete({ where: { id: existing.id } });
    return { error: null, reaction: null };
  }

  await prisma.updateReaction.upsert({
    where: { updateId_userId: { updateId, userId: session.user.id } },
    update: { emoji },
    create: { updateId, userId: session.user.id, emoji },
  });

  return { error: null, reaction: emoji };
}

// Registra che l'utente ha aperto questo Update (base per il contorno visto/non visto dei
// cerchi in Home). "Fire and forget" lato client, nessun blocco della lettura se fallisce.
export async function markUpdateViewed(updateId: string): Promise<void> {
  const session = await getCurrentSession();
  if (!session) return;

  const update = await prisma.update.findUnique({ where: { id: updateId }, select: { id: true } });
  if (!update) return;

  await prisma.updateView.upsert({
    where: { updateId_userId: { updateId, userId: session.user.id } },
    update: {},
    create: { updateId, userId: session.user.id },
  });
}
