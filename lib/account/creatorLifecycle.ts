import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { deleteImage, deleteVideo } from "@/lib/r2";
import { deleteLightVideo } from "@/lib/stream";

/**
 * Ciclo di vita della modalità Creator (S3, 2026-10-04). Chi non pubblica da un po' riceve avvisi
 * e, alla fine, perde i Journey online. Il ciclo parte solo per chi ha scelto Creator: un Visitatore
 * non riceve mai avvisi.
 *
 * Stadi: 0 nessun avviso, 1 avviso a 6 mesi, 2 secondo avviso a 9 mesi, 3 chiusura a 10 mesi.
 * Il conteggio parte dall'ultima pubblicazione (Journey, Episodio o Update), o da quando è stata
 * attivata la modalità Creator se non ha mai pubblicato nulla.
 */

export const NOTICE_STAGE = { NONE: 0, FIRST: 1, SECOND: 2, CLOSURE: 3 } as const;
export type NoticeStage = (typeof NOTICE_STAGE)[keyof typeof NOTICE_STAGE];

/** Mesi di inattività dopo i quali scatta ciascuno stadio. */
export const NOTICE_MONTHS: Record<Exclude<NoticeStage, 0>, number> = { 1: 6, 2: 9, 3: 10 };

/** Giorni tra la chiusura e la cancellazione definitiva, durante i quali si può riattivare. */
export const RESTORE_WINDOW_DAYS = 30;

/** Aggiunge mesi senza sconfinare: 31 agosto + 6 mesi = 28 (o 29) febbraio, non inizio di marzo. */
export function addMonths(date: Date, months: number): Date {
  const day = date.getDate();
  const result = new Date(date);
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDayOfMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDayOfMonth));
  return result;
}

/** Stadio che corrisponde al tempo trascorso dall'ultima pubblicazione. */
export function dueNoticeStage(lastActivityAt: Date, now: Date): NoticeStage {
  if (now >= addMonths(lastActivityAt, NOTICE_MONTHS[3])) return NOTICE_STAGE.CLOSURE;
  if (now >= addMonths(lastActivityAt, NOTICE_MONTHS[2])) return NOTICE_STAGE.SECOND;
  if (now >= addMonths(lastActivityAt, NOTICE_MONTHS[1])) return NOTICE_STAGE.FIRST;
  return NOTICE_STAGE.NONE;
}

/**
 * Stadio da applicare oggi. Se il creator ha pubblicato dopo l'ultimo avviso, il ciclo riparte
 * da zero: l'avviso vecchio non deve restare valido.
 */
export function resolveNoticeStage(input: {
  storedStage: NoticeStage;
  storedNoticeAt: Date | null;
  lastActivityAt: Date;
  now: Date;
}): NoticeStage {
  const { storedStage, storedNoticeAt, lastActivityAt, now } = input;
  const publishedAfterNotice = storedNoticeAt !== null && lastActivityAt > storedNoticeAt;
  const currentStage = publishedAfterNotice ? NOTICE_STAGE.NONE : storedStage;
  const dueStage = dueNoticeStage(lastActivityAt, now);
  return dueStage > currentStage ? dueStage : currentStage;
}

/** Ultima attività del creator: pubblicazione di Journey, Episodio o Update, o inizio della modalità. */
export async function getLastActivityAt(input: {
  creatorId: string;
  baseDate: Date;
}): Promise<Date> {
  const [journey, episode, update] = await Promise.all([
    prisma.journey.findFirst({
      where: { creatorId: input.creatorId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.episode.findFirst({
      where: { journey: { creatorId: input.creatorId } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.update.findFirst({
      where: { creatorId: input.creatorId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  const dates = [input.baseDate, journey?.createdAt, episode?.createdAt, update?.createdAt].filter(
    (date): date is Date => date instanceof Date
  );
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}

/** Attiva la modalità Creator. Ripristina i Journey nascosti da una chiusura precedente, se ancora recuperabili. */
export async function turnOnCreatorMode(userId: string): Promise<void> {
  const now = new Date();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } });
  const creator = await prisma.creator.upsert({
    where: { userId },
    create: { userId, displayName: user.name },
    update: {},
    select: { id: true },
  });

  const hiddenJourneys = await prisma.journey.findMany({
    where: { creatorId: creator.id, lifecycleDeleteAt: { gt: now } },
    select: { id: true, lifecycleStatusBefore: true },
  });

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { creatorMode: true, creatorModeAt: now } }),
    prisma.creator.update({
      where: { id: creator.id },
      data: { inactivityNoticeStage: NOTICE_STAGE.NONE, inactivityNoticeAt: null },
    }),
    ...hiddenJourneys.map((journey) =>
      prisma.journey.update({
        where: { id: journey.id },
        data: {
          status: journey.lifecycleStatusBefore ?? "DRAFT",
          lifecycleStatusBefore: null,
          lifecycleDeleteAt: null,
        },
      })
    ),
  ]);
}

/**
 * Chiude la modalità Creator: i Journey attivi vengono nascosti (archiviati) e programmati per la
 * cancellazione tra 30 giorni. Usato sia dallo spegnimento volontario sia dalla chiusura automatica.
 * Gli Journey già archiviati a mano dal creator non vengono toccati.
 */
export async function turnOffCreatorMode(userId: string): Promise<number> {
  const now = new Date();
  const deleteAt = new Date(now.getTime() + RESTORE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const journeys = await prisma.journey.findMany({
    where: { creator: { userId }, status: { not: "ARCHIVED" }, deletedAt: null },
    select: { id: true, status: true },
  });

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { creatorMode: false } }),
    prisma.creator.updateMany({
      where: { userId },
      data: { inactivityNoticeStage: NOTICE_STAGE.NONE, inactivityNoticeAt: null },
    }),
    ...journeys.map((journey) =>
      prisma.journey.update({
        where: { id: journey.id },
        data: {
          status: "ARCHIVED",
          lifecycleStatusBefore: journey.status,
          lifecycleDeleteAt: deleteAt,
        },
      })
    ),
  ]);

  return journeys.length;
}

/** Quanti Journey verrebbero nascosti spegnendo la modalità Creator (per la domanda di conferma). */
export async function countJourneysToHide(userId: string): Promise<number> {
  return prisma.journey.count({
    where: { creator: { userId }, status: { not: "ARCHIVED" }, deletedAt: null },
  });
}

const EMAIL_LINK = `${process.env.BETTER_AUTH_URL ?? ""}/settings/creator`;

const NOTICE_EMAILS: Record<Exclude<NoticeStage, 0>, { subject: string; body: string }> = {
  1: {
    subject: "Your Zero Creator account has been quiet for 6 months",
    body: "It has been 6 months since you last published on Zero. Your Journeys are still online. If you are done with Creator mode, you can switch it off in your settings. If nothing changes, we will send you one more reminder in 3 months.",
  },
  2: {
    subject: "Your Zero Creator account: one month left",
    body: "It has been 9 months since you last published on Zero. If you do not publish in the next month, we will close Creator mode. Your Journeys will then be hidden, and permanently deleted 30 days later unless you turn Creator mode back on.",
  },
  3: {
    subject: "Your Zero Creator mode has been closed",
    body: "Creator mode has been closed after 10 months without publishing. Your Journeys are now hidden from Zero. You can turn Creator mode back on within 30 days to restore them. After 30 days they will be permanently deleted.",
  },
};

async function sendNoticeEmail(input: { to: string; name: string; stage: Exclude<NoticeStage, 0> }) {
  const notice = NOTICE_EMAILS[input.stage];
  await sendEmail({
    to: input.to,
    subject: notice.subject,
    html: `<p>Hi ${input.name},</p><p>${notice.body}</p><p><a href="${EMAIL_LINK}">Open your Creator settings</a></p>`,
  });
}

/**
 * Esegue un giro del ciclo per tutti i creator attivi: invia l'avviso dovuto (una sola volta per
 * stadio) e chiude la modalità quando scatta la chiusura. Poi cancella per sempre i Journey
 * nascosti la cui finestra di recupero è scaduta. Chiamato una volta al giorno dal cron.
 */
export async function runCreatorLifecycle(now: Date = new Date()): Promise<{
  noticesSent: number;
  closed: number;
  journeysDeleted: number;
}> {
  const users = await prisma.user.findMany({
    where: { creatorMode: true },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      creatorModeAt: true,
      creator: { select: { id: true, inactivityNoticeStage: true, inactivityNoticeAt: true } },
    },
  });

  let noticesSent = 0;
  let closed = 0;

  for (const user of users) {
    // Chi ha scelto Creator in registrazione può non avere ancora la riga Creator: la creiamo qui.
    const creator =
      user.creator ?? (await prisma.creator.create({ data: { userId: user.id, displayName: user.name }, select: { id: true, inactivityNoticeStage: true, inactivityNoticeAt: true } }));

    const storedStage = creator.inactivityNoticeStage as NoticeStage;
    const lastActivityAt = await getLastActivityAt({
      creatorId: creator.id,
      baseDate: user.creatorModeAt ?? user.createdAt,
    });
    const stage = resolveNoticeStage({
      storedStage,
      storedNoticeAt: creator.inactivityNoticeAt,
      lastActivityAt,
      now,
    });

    if (stage === storedStage) continue;

    if (stage === NOTICE_STAGE.NONE) {
      await prisma.creator.update({
        where: { id: creator.id },
        data: { inactivityNoticeStage: NOTICE_STAGE.NONE, inactivityNoticeAt: null },
      });
      continue;
    }

    await sendNoticeEmail({ to: user.email, name: user.name, stage });
    noticesSent += 1;

    if (stage === NOTICE_STAGE.CLOSURE) {
      await turnOffCreatorMode(user.id);
      closed += 1;
    } else {
      await prisma.creator.update({
        where: { id: creator.id },
        data: { inactivityNoticeStage: stage, inactivityNoticeAt: now },
      });
    }
  }

  const journeysDeleted = await deleteExpiredHiddenJourneys(now);
  return { noticesSent, closed, journeysDeleted };
}

/** Cancella per sempre i Journey nascosti la cui finestra di recupero è scaduta, file su R2 compresi. */
export async function deleteExpiredHiddenJourneys(now: Date = new Date()): Promise<number> {
  const expired = await prisma.journey.findMany({
    where: { lifecycleDeleteAt: { lte: now } },
    select: {
      id: true,
      coverUrl: true,
      episodes: { select: { id: true, videoKey: true, posterKey: true, lightVideoId: true } },
    },
  });
  if (expired.length === 0) return 0;

  const journeyIds = expired.map((journey) => journey.id);
  const episodeIds = expired.flatMap((journey) => journey.episodes.map((episode) => episode.id));

  await prisma.$transaction([
    prisma.update.updateMany({ where: { linkedJourneyId: { in: journeyIds } }, data: { linkedJourneyId: null } }),
    prisma.update.updateMany({ where: { linkedEpisodeId: { in: episodeIds } }, data: { linkedEpisodeId: null } }),
    prisma.like.deleteMany({ where: { targetType: "EPISODE", targetId: { in: episodeIds } } }),
    prisma.episodeProgress.deleteMany({ where: { episodeId: { in: episodeIds } } }),
    prisma.episode.deleteMany({ where: { id: { in: episodeIds } } }),
    prisma.chapter.deleteMany({ where: { journeyId: { in: journeyIds } } }),
    prisma.journeyProgress.deleteMany({ where: { journeyId: { in: journeyIds } } }),
    prisma.journey.deleteMany({ where: { id: { in: journeyIds } } }),
  ]);

  // I file vengono rimossi dopo il database, stesso ordine di hardDeleteUser (lib/account/deletion.ts).
  for (const journey of expired) {
    if (journey.coverUrl) await deleteImage(journey.coverUrl);
    for (const episode of journey.episodes) {
      if (episode.videoKey) await deleteVideo(episode.videoKey);
      if (episode.posterKey) await deleteImage(episode.posterKey);
      if (episode.lightVideoId) await deleteLightVideo(episode.lightVideoId);
    }
  }

  return expired.length;
}
