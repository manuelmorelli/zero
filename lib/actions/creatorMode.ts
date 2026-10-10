"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  endCreatorPause,
  startCreatorPause,
  turnOffCreatorMode,
  turnOnCreatorMode,
} from "@/lib/account/creatorLifecycle";

/** Interruttore Visitatore/Creator in Impostazioni. Spegnere nasconde i Journey (recuperabili 30 giorni). */
export async function setCreatorMode(enabled: boolean): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  if (enabled) {
    await turnOnCreatorMode(user.id);
  } else {
    await turnOffCreatorMode(user.id);
  }

  revalidatePath("/settings/creator");
  revalidatePath("/dashboard");
  return { error: null };
}

/** Pausa del creator: nessun avviso per i primi 10 mesi, i Journey restano online. */
export async function setCreatorPause(paused: boolean): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  if (paused) {
    await startCreatorPause(user.id);
  } else {
    await endCreatorPause(user.id);
  }

  revalidatePath("/settings/creator");
  return { error: null };
}

/** Consenso del creator al doppiaggio futuro della sua voce in altre lingue (solo il permesso, Post-MVP). */
export async function setVoiceDubbingConsent(allowed: boolean): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  await prisma.creator.update({
    where: { userId: user.id },
    data: { allowsVoiceDubbing: allowed },
  });

  revalidatePath("/settings/creator");
  return { error: null };
}
