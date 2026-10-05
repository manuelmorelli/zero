"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession, getCurrentSession } from "@/lib/session";
import { JOURNEY_CATEGORIES } from "@/lib/constants/categories";
import { requestAccountDeletion, reactivateAccount } from "@/lib/account/deletion";
import { deleteImage, getImagePlaybackUrl } from "@/lib/r2";
import { moderateImageUrl, moderateText, MODERATION_REJECTION_MESSAGE } from "@/lib/moderation";

const AccountSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long.").max(100),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_-]{3,30}$/, "Username must be 3-30 characters: lowercase letters, numbers, - or _.")
    .optional(),
  bio: z.string().trim().max(250, "Bio must be at most 250 characters long."),
  location: z.string().trim().max(100).optional(),
  interests: z.array(z.enum(JOURNEY_CATEGORIES)).min(1, "Pick at least one interest."),
  // Chiave R2 della nuova foto caricata in questo salvataggio: vuota/assente = nessun
  // cambiamento, la foto esistente (se c'è) resta quella già salvata.
  avatarKey: z.string().trim().optional(),
  coverKey: z.string().trim().optional(),
});

export async function updateAccount(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  const parsed = AccountSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username") || undefined,
    bio: formData.get("bio"),
    location: formData.get("location") || undefined,
    interests: formData.getAll("interests"),
    avatarKey: formData.get("avatarKey") || undefined,
    coverKey: formData.get("coverKey") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  // Primo filtro automatico (lib/moderation.ts, Gemini): se il servizio non risponde, il contenuto viene pubblicato comunque.
  const bioModeration = await moderateText(parsed.data.bio);
  if (bioModeration.flagged) return { error: MODERATION_REJECTION_MESSAGE };

  for (const key of [parsed.data.avatarKey, parsed.data.coverKey]) {
    if (!key) continue;
    const playbackUrl = await getImagePlaybackUrl(key);
    const imageModeration = await moderateImageUrl(playbackUrl);
    if (imageModeration.flagged) {
      await deleteImage(key);
      return { error: MODERATION_REJECTION_MESSAGE };
    }
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        username: parsed.data.username ?? null,
        bio: parsed.data.bio || null,
        location: parsed.data.location ?? null,
        interests: parsed.data.interests,
        ...(parsed.data.avatarKey ? { avatarUrl: parsed.data.avatarKey } : {}),
        ...(parsed.data.coverKey ? { coverUrl: parsed.data.coverKey } : {}),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "This username is already taken." };
    }
    throw error;
  }

  revalidatePath(`/profile/${user.id}`);
  if (parsed.data.username) revalidatePath(`/profile/${parsed.data.username}`);
  return { error: null };
}

/** Avvia la cancellazione dell'account (dietro conferma esplicita, vedi
 * components/profile/DeleteAccountSection.tsx). L'utente resta nel database per il periodo di
 * grazia (lib/account/deletion.ts) ma sparisce subito da ricerca, profilo pubblico e Discovery. */
export async function requestAccountDeletionAction(): Promise<void> {
  const { user } = await requireSession();
  await requestAccountDeletion(user.id);
  redirect("/account/deletion-scheduled");
}

/** Annulla una cancellazione in corso: non passa da requireSession() perché durante il periodo
 * di grazia requireSession() rimanderebbe qui stesso (vedi lib/session.ts). */
export async function reactivateAccountAction(): Promise<void> {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  await reactivateAccount(session.user.id);
  redirect("/");
}
