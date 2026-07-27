import { prisma } from "@/lib/prisma";

/** Un Update resta attivo per 24 ore dalla pubblicazione (09_Updates.md: "contenuti temporanei"). */
export const UPDATE_LIFETIME_MS = 24 * 60 * 60 * 1000;

/**
 * Elimina dal database gli Update la cui scadenza è già passata. Nessun cron job né servizio
 * in background: viene chiamata ad ogni lettura di Update (Dashboard e Home), così la pulizia
 * avviene come effetto collaterale delle normali operazioni dell'app.
 */
export async function deleteExpiredUpdates(): Promise<void> {
  await prisma.update.deleteMany({ where: { archivedAt: { lte: new Date() } } });
}
