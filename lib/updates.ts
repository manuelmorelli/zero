import { prisma } from "@/lib/prisma";
import { deleteImage, deleteVideo, getImagePlaybackUrl, getVideoPlaybackUrl } from "@/lib/r2";
import type { Update, UpdateType } from "@/generated/prisma/client";

/** Un Update resta attivo per 24 ore dalla pubblicazione (09_Updates.md: "contenuti temporanei"). */
export const UPDATE_LIFETIME_MS = 24 * 60 * 60 * 1000;

/**
 * Elimina dal database gli Update la cui scadenza è già passata. Nessun cron job né servizio
 * in background: viene chiamata ad ogni lettura di Update (Dashboard e Home), così la pulizia
 * avviene come effetto collaterale delle normali operazioni dell'app. Righe collegate (voti,
 * risposte, reazioni, visualizzazioni, opzioni sondaggio) spariscono da sole via cascade a
 * livello database; il file su Cloudflare (foto/video) invece non è collegato dal database e va
 * ripulito qui esplicitamente, altrimenti resterebbe orfano su R2.
 */
export async function deleteExpiredUpdates(): Promise<void> {
  const expired = await prisma.update.findMany({
    where: { archivedAt: { lte: new Date() } },
    select: { id: true, type: true, mediaKey: true },
  });
  if (expired.length === 0) return;

  await prisma.update.deleteMany({ where: { id: { in: expired.map((update) => update.id) } } });

  await Promise.all(
    expired
      .filter((update) => update.mediaKey)
      .map((update) =>
        update.type === "VIDEO" ? deleteVideo(update.mediaKey!) : deleteImage(update.mediaKey!)
      )
  );
}

/** Anteprima breve di un Update per i punti dell'interfaccia che mostrano solo una riga di testo
 * (es. pannello Updates in Hero): per i tipi senza un testo naturale (foto/video/domanda) usa
 * un'etichetta al posto del corpo, invece di mostrare una riga vuota. */
export function summarizeUpdate(update: Pick<Update, "type" | "content">): string {
  if (update.content.trim()) return update.content;
  switch (update.type) {
    case "IMAGE":
      return "📷 Photo";
    case "VIDEO":
      return "🎥 Video";
    default:
      return "New update";
  }
}

/* ------------------------------------------------------------------ */
/* UPDATE DEL CREATOR PER LA DASHBOARD (con foto/video/sondaggio/risposte/reazioni) */
/* ------------------------------------------------------------------ */

export type DashboardUpdate = {
  id: string;
  type: UpdateType;
  content: string;
  mediaUrl: string | null;
  publishedAt: Date;
  poll: { options: { id: string; label: string; votes: number }[]; totalVotes: number } | null;
  isQuestion: boolean;
  answers: { id: string; content: string; createdAt: Date }[];
  reactions: { emoji: string; count: number }[];
};

function summarizeReactions(emojis: string[]): { emoji: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const emoji of emojis) counts.set(emoji, (counts.get(emoji) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count);
}

/** Update ancora attivi di un creator, arricchiti per la Dashboard: risposte alle Domande e
 * conteggio reazioni sono privati (visibili solo qui, mai in pubblico). */
export async function getOwnUpdatesForDashboard(creatorId: string): Promise<DashboardUpdate[]> {
  await deleteExpiredUpdates();

  const updates = await prisma.update.findMany({
    where: { creatorId, archivedAt: { gt: new Date() } },
    orderBy: { publishedAt: "desc" },
    include: {
      pollOptions: { orderBy: { order: "asc" }, include: { _count: { select: { votes: true } } } },
      answers: { orderBy: { createdAt: "desc" }, select: { id: true, content: true, createdAt: true } },
      reactions: { select: { emoji: true } },
    },
  });

  return Promise.all(
    updates.map(async (update) => ({
      id: update.id,
      type: update.type,
      content: update.content,
      mediaUrl: update.mediaKey
        ? await (update.type === "VIDEO"
            ? getVideoPlaybackUrl(update.mediaKey)
            : getImagePlaybackUrl(update.mediaKey))
        : null,
      publishedAt: update.publishedAt,
      poll:
        update.pollOptions.length > 0
          ? {
              options: update.pollOptions.map((option) => ({
                id: option.id,
                label: option.label,
                votes: option._count.votes,
              })),
              totalVotes: update.pollOptions.reduce((sum, option) => sum + option._count.votes, 0),
            }
          : null,
      isQuestion: update.isQuestion || update.type === "QUESTION",
      answers: update.answers,
      reactions: summarizeReactions(update.reactions.map((reaction) => reaction.emoji)),
    }))
  );
}
