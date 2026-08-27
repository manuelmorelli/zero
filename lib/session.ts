import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Controllo autoritativo (interroga il database): usarlo in ogni pagina protetta.
 * Un account con cancellazione in corso (vedi lib/account/deletion.ts) viene dirottato sulla
 * schermata di riattivazione invece di entrare normalmente nell'app. */
export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { deletedAt: true },
  });
  if (user?.deletedAt) redirect("/reactivate-account");

  return session;
}

/** Come getCurrentSession(), ma per le pagine "ibride" (visibili sia a chi è loggato che a chi
 * non lo è: Home, Discovery, profilo pubblico, pagine Journey) che quindi non passano da
 * requireSession(). Se chi guarda ha un account in cancellazione, viene comunque dirottato sulla
 * schermata di riattivazione invece di entrare come se nulla fosse. Non usarla in
 * /reactivate-account o /account/deletion-scheduled: andrebbe in loop su se stessa. */
export async function getViewerSession() {
  const session = await getCurrentSession();
  if (!session) return session;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { deletedAt: true },
  });
  if (user?.deletedAt) redirect("/reactivate-account");

  return session;
}
