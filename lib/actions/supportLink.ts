"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCreator } from "@/lib/creator";

const MAX_SUPPORT_LINK_LENGTH = 300;
const OWN_DOMAINS = new Set(["zerojourneys.com", "www.zerojourneys.com"]);

const supportLinkSchema = z.string().trim().max(MAX_SUPPORT_LINK_LENGTH, "The link is too long.");

/** Controlla che il link sia un indirizzo web completo (https) e non punti a Zero stesso. */
function validateSupportLink(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "Enter a valid link, starting with https://";
  }
  if (url.protocol !== "https:") return "The link must start with https://";
  if (OWN_DOMAINS.has(url.hostname)) return "Enter a link to an external platform, not to Zero.";
  return null;
}

/** Salva, modifica o rimuove il link di supporto del creator loggato. Un campo vuoto (o il pulsante "remove") lo toglie. */
export async function updateSupportLink(
  _previous: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { creator } = await requireCreator();

  const removing = formData.get("remove") === "1";
  const parsed = supportLinkSchema.safeParse(formData.get("supportLinkUrl") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const value = removing ? "" : parsed.data;
  const supportLinkUrl = value === "" ? null : value;

  if (supportLinkUrl) {
    const linkError = validateSupportLink(supportLinkUrl);
    if (linkError) return { error: linkError };
  }

  await prisma.creator.update({
    where: { id: creator.id },
    data: { supportLinkUrl },
  });

  revalidatePath("/settings/creator");
  revalidatePath(`/profile/${creator.userId}`);
  return { error: null };
}
