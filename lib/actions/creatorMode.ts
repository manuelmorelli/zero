"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { turnOffCreatorMode, turnOnCreatorMode } from "@/lib/account/creatorLifecycle";

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
