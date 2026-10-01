"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { JOURNEY_CATEGORIES } from "@/lib/constants/categories";

const AccountDetailsSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long.").max(100),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_-]{3,30}$/, "Username must be 3-30 characters: lowercase letters, numbers, - or _.")
    .optional(),
  bio: z.string().trim().max(250, "Bio must be at most 250 characters long."),
  location: z.string().trim().max(100).optional(),
});

/** Settings > Account: nome, username, bio, località. La foto profilo/copertina resta gestita
 * solo dal pop-up "Edit profile" sul Profilo pubblico (components/profile/EditProfileButton.tsx)
 * per non duplicare qui il flusso di ritaglio/upload immagine. */
export async function updateAccountDetails(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  const parsed = AccountDetailsSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username") || undefined,
    bio: formData.get("bio"),
    location: formData.get("location") || undefined,
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
        bio: parsed.data.bio || null,
        location: parsed.data.location ?? null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "This username is already taken." };
    }
    throw error;
  }

  revalidatePath("/settings/account");
  revalidatePath(`/profile/${user.id}`);
  if (parsed.data.username) revalidatePath(`/profile/${parsed.data.username}`);
  return { error: null };
}

const InterestsSchema = z.object({
  interests: z.array(z.enum(JOURNEY_CATEGORIES)).min(1, "Pick at least one interest."),
});

/** Settings > Interests: stesse categorie scelte in Onboarding. */
export async function updateInterests(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  const parsed = InterestsSchema.safeParse({ interests: formData.getAll("interests") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { interests: parsed.data.interests },
  });

  revalidatePath("/settings/interests");
  revalidatePath(`/profile/${user.id}`);
  return { error: null };
}

const NotificationPreferencesSchema = z.object({
  notifyNewEpisode: z.coerce.boolean(),
  notifyNewJourney: z.coerce.boolean(),
  notifyQuestionAnswered: z.coerce.boolean(),
  notifyNewOffering: z.coerce.boolean(),
});

/** Settings > Notifications: quali eventi generano una notifica per l'utente (lib/notifications.ts
 * legge questi campi prima di crearle). Checkbox non spuntata = assente dal FormData = false. */
export async function updateNotificationPreferences(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  const parsed = NotificationPreferencesSchema.safeParse({
    notifyNewEpisode: formData.has("notifyNewEpisode"),
    notifyNewJourney: formData.has("notifyNewJourney"),
    notifyQuestionAnswered: formData.has("notifyQuestionAnswered"),
    notifyNewOffering: formData.has("notifyNewOffering"),
  });
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  revalidatePath("/settings/notifications");
  return { error: null };
}

/** Settings > Privacy: chi non ti segue ancora vede solo nome/foto/bio, non Journey/Update (vedi
 * app/profile/[username]/page.tsx). Non impedisce ai Journey pubblicati di comparire in
 * Discovery/Ricerca: quelle sezioni non leggono questo campo, solo il Profilo lo fa. */
export async function updatePrivateAccount(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  await prisma.user.update({
    where: { id: user.id },
    data: { isPrivate: formData.has("isPrivate") },
  });

  revalidatePath("/settings/privacy");
  revalidatePath(`/profile/${user.id}`);
  return { error: null };
}

const CreatorNotificationPreferencesSchema = z.object({
  notifyNewFollower: z.coerce.boolean(),
});

/** Settings > Creator: preferenze notifiche specifiche del ruolo di creator (chi ti segue), a
 * sé rispetto a `updateNotificationPreferences` — un unico form condiviso sovrascriverebbe i
 * campi dell'altra pagina non inclusi nel suo FormData. */
export async function updateCreatorNotificationPreferences(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  const parsed = CreatorNotificationPreferencesSchema.safeParse({
    notifyNewFollower: formData.has("notifyNewFollower"),
  });
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  revalidatePath("/settings/creator");
  return { error: null };
}
