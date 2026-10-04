"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, requireSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";

const ADMIN_REPORTS_PATH = "/admin/reports";

const StatusSchema = z.enum(["PENDING", "REVIEWING", "RESOLVED"]);

/** Controllo sul server: la pagina nascosta non basta, ogni azione verifica di nuovo. */
async function requireAdmin() {
  const session = await requireSession();
  if (!isAdminEmail(session.user.email)) throw new Error("Not authorized.");
}

/** Serve al menu laterale per mostrare o nascondere la voce "Segnalazioni". */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await getCurrentSession();
  return isAdminEmail(session?.user.email);
}

export async function listReports() {
  await requireAdmin();
  return prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });
}

export async function setReportStatus(reportId: string, status: string): Promise<{ error: string | null }> {
  await requireAdmin();

  const parsedStatus = StatusSchema.safeParse(status);
  const parsedId = z.string().min(1).safeParse(reportId);
  if (!parsedStatus.success || !parsedId.success) return { error: "Richiesta non valida." };

  const isResolved = parsedStatus.data === "RESOLVED";
  await prisma.report.update({
    where: { id: parsedId.data },
    data: { status: parsedStatus.data, resolvedAt: isResolved ? new Date() : null },
  });

  revalidatePath(ADMIN_REPORTS_PATH);
  return { error: null };
}

/** Cancellazione definitiva: la riga sparisce dal database, non si recupera. */
export async function deleteReport(reportId: string): Promise<{ error: string | null }> {
  await requireAdmin();

  const parsedId = z.string().min(1).safeParse(reportId);
  if (!parsedId.success) return { error: "Richiesta non valida." };

  await prisma.report.delete({ where: { id: parsedId.data } });

  revalidatePath(ADMIN_REPORTS_PATH);
  return { error: null };
}
