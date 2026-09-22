"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";

/**
 * Accettazione delle Community Guidelines, uno dei tre requisiti per poter pubblicare per la
 * prima volta (vedi lib/creator.ts, getPublishReadiness). requireCreator() crea il profilo
 * Creator al volo se manca ancora, stesso comportamento già in uso ovunque nel sito: chi accetta
 * le regole prima ancora di aver pubblicato qualcosa non è un caso anomalo da gestire a parte.
 */
export async function acceptGuidelines(): Promise<{ error: string | null }> {
  const { creator } = await requireCreator();
  if (creator.guidelinesAcceptedAt) return { error: null };

  await prisma.creator.update({
    where: { id: creator.id },
    data: { guidelinesAcceptedAt: new Date() },
  });

  revalidatePath("/community-guidelines");
  return { error: null };
}
