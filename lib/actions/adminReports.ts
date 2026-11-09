"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, requireSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import type { Report } from "@/generated/prisma/client";

const ADMIN_REPORTS_PATH = "/admin/reports";

const StatusSchema = z.enum(["PENDING", "REVIEWING", "RESOLVED"]);

/** Tipi di contenuto segnalato che si possono nascondere subito da qui (hanno già un campo
 * deletedAt rispettato ovunque il contenuto viene letto). Utente/Journeyer restano fuori: nascondere
 * un intero profilo è un'azione diversa (richiede una sospensione account, non ancora costruita). */
const HIDEABLE_TARGET_TYPES = ["JOURNEY", "EPISODE", "COMMENT"] as const;

/** Controllo sul server: la pagina nascosta non basta, ogni azione verifica di nuovo. */
async function requireAdmin() {
  const session = await requireSession();
  if (!isAdminEmail(session.user.email)) throw new Error("Not authorized.");
  return session;
}

/** Risale all'account che ha pubblicato il contenuto segnalato, qualunque sia il tipo di
 * segnalazione: serve per poter bannare l'account da qui invece di dover entrare nel database
 * a mano. Null se il contenuto (o l'account collegato) non esiste più. */
async function resolveOwnerUserId(report: Pick<Report, "targetType" | "targetId">): Promise<string | null> {
  switch (report.targetType) {
    case "USER":
      return report.targetId;
    case "CREATOR": {
      const creator = await prisma.creator.findUnique({ where: { id: report.targetId }, select: { userId: true } });
      return creator?.userId ?? null;
    }
    case "JOURNEY": {
      const journey = await prisma.journey.findUnique({
        where: { id: report.targetId },
        select: { creator: { select: { userId: true } } },
      });
      return journey?.creator.userId ?? null;
    }
    case "EPISODE": {
      const episode = await prisma.episode.findUnique({
        where: { id: report.targetId },
        select: { journey: { select: { creator: { select: { userId: true } } } } },
      });
      return episode?.journey.creator.userId ?? null;
    }
    case "UPDATE": {
      const update = await prisma.update.findUnique({
        where: { id: report.targetId },
        select: { creator: { select: { userId: true } } },
      });
      return update?.creator.userId ?? null;
    }
    case "COMMENT": {
      const comment = await prisma.forumMessage.findUnique({ where: { id: report.targetId }, select: { authorId: true } });
      return comment?.authorId ?? null;
    }
    default:
      return null;
  }
}

/** Serve al menu laterale per mostrare o nascondere la voce "Segnalazioni". */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await getCurrentSession();
  return isAdminEmail(session?.user.email);
}

export async function listReports() {
  await requireAdmin();
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });

  const idsByType = {
    JOURNEY: reports.filter((report) => report.targetType === "JOURNEY").map((report) => report.targetId),
    EPISODE: reports.filter((report) => report.targetType === "EPISODE").map((report) => report.targetId),
    COMMENT: reports.filter((report) => report.targetType === "COMMENT").map((report) => report.targetId),
  };

  const [journeys, episodes, comments] = await Promise.all([
    idsByType.JOURNEY.length
      ? prisma.journey.findMany({ where: { id: { in: idsByType.JOURNEY } }, select: { id: true, deletedAt: true } })
      : [],
    idsByType.EPISODE.length
      ? prisma.episode.findMany({ where: { id: { in: idsByType.EPISODE } }, select: { id: true, deletedAt: true } })
      : [],
    idsByType.COMMENT.length
      ? prisma.forumMessage.findMany({ where: { id: { in: idsByType.COMMENT } }, select: { id: true, deletedAt: true } })
      : [],
  ]);

  // Il contenuto può essere già sparito (il proprietario lo ha cancellato per sempre): in quel
  // caso lo trattiamo come già nascosto, non c'è più nulla da nascondere.
  const existingIds = new Set([...journeys, ...episodes, ...comments].map((item) => item.id));
  const visibleIds = new Set(
    [...journeys, ...episodes, ...comments].filter((item) => !item.deletedAt).map((item) => item.id),
  );

  // Chi ha pubblicato il contenuto segnalato, per poter bannare l'account da qui (vedi
  // banReportedAccount più sotto). Una query per segnalazione: la lista è piccola (max 200),
  // non vale la pena raggruppare per tipo come sopra.
  const ownerUserIds = await Promise.all(reports.map((report) => resolveOwnerUserId(report)));
  const uniqueOwnerIds = [...new Set(ownerUserIds.filter((id): id is string => id !== null))];
  const owners = uniqueOwnerIds.length
    ? await prisma.user.findMany({ where: { id: { in: uniqueOwnerIds } }, select: { id: true, status: true } })
    : [];
  const statusByUserId = new Map(owners.map((owner) => [owner.id, owner.status]));

  return reports.map((report, index) => {
    const ownerUserId = ownerUserIds[index];
    return {
      ...report,
      contentHidden:
        HIDEABLE_TARGET_TYPES.includes(report.targetType as (typeof HIDEABLE_TARGET_TYPES)[number]) &&
        (!existingIds.has(report.targetId) || !visibleIds.has(report.targetId)),
      ownerUserId,
      accountBanned: ownerUserId !== null && statusByUserId.get(ownerUserId) === "BANNED",
    };
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

/** Nasconde subito il contenuto segnalato (stesso campo deletedAt già usato ovunque un contenuto
 * può essere nascosto) e chiude la segnalazione: pensata per i casi gravi, dove aspettare un
 * admin che cancelli il contenuto a mano altrove sarebbe troppo lento. */
export async function hideReportedContent(reportId: string): Promise<{ error: string | null }> {
  await requireAdmin();

  const parsedId = z.string().min(1).safeParse(reportId);
  if (!parsedId.success) return { error: "Richiesta non valida." };

  const report = await prisma.report.findUnique({ where: { id: parsedId.data } });
  if (!report) return { error: "Segnalazione non trovata." };

  const now = new Date();
  if (report.targetType === "JOURNEY") {
    await prisma.journey.updateMany({ where: { id: report.targetId }, data: { deletedAt: now } });
  } else if (report.targetType === "EPISODE") {
    await prisma.episode.updateMany({ where: { id: report.targetId }, data: { deletedAt: now } });
  } else if (report.targetType === "COMMENT") {
    await prisma.forumMessage.updateMany({ where: { id: report.targetId }, data: { deletedAt: now } });
  } else {
    return { error: "Questo tipo di contenuto non si può nascondere da qui." };
  }

  await prisma.report.update({ where: { id: report.id }, data: { status: "RESOLVED", resolvedAt: now } });

  revalidatePath(ADMIN_REPORTS_PATH);
  return { error: null };
}

/** Fa tornare visibile un contenuto nascosto da qui per errore. Non riapre la segnalazione:
 * quella resta risolta, basta "Riapri" se serve gestirla ancora. */
export async function unhideReportedContent(reportId: string): Promise<{ error: string | null }> {
  await requireAdmin();

  const parsedId = z.string().min(1).safeParse(reportId);
  if (!parsedId.success) return { error: "Richiesta non valida." };

  const report = await prisma.report.findUnique({ where: { id: parsedId.data } });
  if (!report) return { error: "Segnalazione non trovata." };

  if (report.targetType === "JOURNEY") {
    await prisma.journey.updateMany({ where: { id: report.targetId }, data: { deletedAt: null } });
  } else if (report.targetType === "EPISODE") {
    await prisma.episode.updateMany({ where: { id: report.targetId }, data: { deletedAt: null } });
  } else if (report.targetType === "COMMENT") {
    await prisma.forumMessage.updateMany({ where: { id: report.targetId }, data: { deletedAt: null } });
  } else {
    return { error: "Questo tipo di contenuto non si può nascondere da qui." };
  }

  revalidatePath(ADMIN_REPORTS_PATH);
  return { error: null };
}

/** Banna subito l'account che ha pubblicato il contenuto segnalato (qualunque sia il tipo di
 * segnalazione) e chiude la segnalazione. L'account bannato viene disconnesso e rimandato su
 * /account-suspended al prossimo accesso (vedi lib/session.ts). Pensata per i casi più gravi
 * (es. materiale di abuso su minori): nascondere il contenuto con "Nascondi subito" non basta,
 * va impedito anche che la stessa persona continui a usare l'account. */
export async function banReportedAccount(reportId: string): Promise<{ error: string | null }> {
  const session = await requireAdmin();

  const parsedId = z.string().min(1).safeParse(reportId);
  if (!parsedId.success) return { error: "Richiesta non valida." };

  const report = await prisma.report.findUnique({ where: { id: parsedId.data } });
  if (!report) return { error: "Segnalazione non trovata." };

  const ownerUserId = await resolveOwnerUserId(report);
  if (!ownerUserId) return { error: "Non troviamo l'account collegato a questo contenuto." };
  if (ownerUserId === session.user.id) return { error: "Non puoi bannare il tuo stesso account." };

  const now = new Date();
  await prisma.user.update({ where: { id: ownerUserId }, data: { status: "BANNED" } });
  await prisma.report.update({ where: { id: report.id }, data: { status: "RESOLVED", resolvedAt: now } });

  revalidatePath(ADMIN_REPORTS_PATH);
  return { error: null };
}

/** Riattiva un account bannato da qui per errore. */
export async function unbanReportedAccount(reportId: string): Promise<{ error: string | null }> {
  await requireAdmin();

  const parsedId = z.string().min(1).safeParse(reportId);
  if (!parsedId.success) return { error: "Richiesta non valida." };

  const report = await prisma.report.findUnique({ where: { id: parsedId.data } });
  if (!report) return { error: "Segnalazione non trovata." };

  const ownerUserId = await resolveOwnerUserId(report);
  if (!ownerUserId) return { error: "Non troviamo l'account collegato a questo contenuto." };

  await prisma.user.update({ where: { id: ownerUserId }, data: { status: "ACTIVE" } });

  revalidatePath(ADMIN_REPORTS_PATH);
  return { error: null };
}
