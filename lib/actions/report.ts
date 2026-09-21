"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";
import type { ReportTargetType } from "@/generated/prisma/client";

const ReportSchema = z.object({
  targetType: z.enum(["USER", "CREATOR", "JOURNEY", "UPDATE", "COMMENT"]),
  targetId: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(100),
  detail: z.string().trim().max(500).optional(),
});

type CreateReportInput = {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  detail?: string;
};

/**
 * Segnalazione contenuti: nessun pannello di gestione per ora, il modello Report esiste già nello
 * schema. Manuel vede e chiude le segnalazioni da Prisma Studio; la mail qui sotto è solo un
 * avviso, non una coda di lavoro vera e propria — coerente con il volume atteso oggi.
 */
export async function createReport(input: CreateReportInput): Promise<{ error: string | null }> {
  const { user } = await requireSession();

  const parsed = ReportSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid report." };
  }

  const reason = parsed.data.detail
    ? `${parsed.data.reason}: ${parsed.data.detail}`
    : parsed.data.reason;

  await prisma.report.create({
    data: {
      userId: user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reason,
    },
  });

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    // Non blocca la segnalazione se l'invio dell'email fallisce: la riga nel database è già la
    // fonte di verità, la mail è solo un avviso.
    await sendEmail({
      to: adminEmail,
      subject: `New report: ${parsed.data.targetType.toLowerCase()}`,
      html: `<p><strong>${user.name}</strong> (${user.email}) reported a ${parsed.data.targetType.toLowerCase()}.</p>
<p><strong>Target ID:</strong> ${parsed.data.targetId}</p>
<p><strong>Reason:</strong> ${reason}</p>`,
    }).catch((error) => console.error("[report] Failed to send admin notification email", error));
  }

  return { error: null };
}
