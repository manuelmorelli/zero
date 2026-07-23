import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

/** Controllo autoritativo: usarlo in ogni pagina riservata ai creator. */
export async function requireCreator() {
  const { user } = await requireSession();

  const creator = await prisma.creator.findUnique({ where: { userId: user.id } });
  if (!creator) redirect("/dashboard/new");

  return { user, creator };
}
