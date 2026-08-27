import { prisma } from "@/lib/prisma";
import { deleteImage, deleteVideo } from "@/lib/r2";

/** Tempo di grazia tra la richiesta di cancellazione e la cancellazione definitiva
 * (docs/91_Legal_Audit_And_Roadmap.md, sezione "Cancellazione dati"). */
export const ACCOUNT_DELETION_GRACE_PERIOD_MS = 10 * 24 * 60 * 60 * 1000;

/**
 * Avvia la cancellazione: nasconde subito l'account (e il suo Creator, se esiste) ovunque
 * tramite i filtri `deletedAt: null` già in uso in tutta l'app per Journey/Chapter/Episode, e
 * fissa la data della cancellazione definitiva. Reversibile fino a quel momento (vedi
 * reactivateAccount).
 */
export async function requestAccountDeletion(userId: string): Promise<void> {
  const now = new Date();
  const scheduledDeletionAt = new Date(now.getTime() + ACCOUNT_DELETION_GRACE_PERIOD_MS);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { deletedAt: now, scheduledDeletionAt } }),
    prisma.creator.updateMany({ where: { userId, deletedAt: null }, data: { deletedAt: now } }),
  ]);
}

/** Annulla una cancellazione in corso, se l'utente rifà login entro il periodo di grazia. */
export async function reactivateAccount(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { deletedAt: null, scheduledDeletionAt: null } }),
    prisma.creator.updateMany({ where: { userId }, data: { deletedAt: null } }),
  ]);
}

/** Chiamata dal cron giornaliero (app/api/cron/purge-accounts/route.ts): cancella per sempre
 * tutti gli account il cui periodo di grazia è scaduto. Ritorna quanti account sono stati cancellati. */
export async function purgeExpiredAccounts(): Promise<number> {
  const expired = await prisma.user.findMany({
    where: { scheduledDeletionAt: { lte: new Date() } },
    select: { id: true },
  });

  for (const { id } of expired) {
    await hardDeleteUser(id);
  }

  return expired.length;
}

/**
 * Cancellazione definitiva e completa di un utente: Journey, Capitoli, Episodi, Update,
 * Conversazioni/Messaggi, e ogni riga collegata spariscono per sempre, media su Cloudflare R2
 * compresi — nessun residuo tipo "account eliminato" (decisione presa con Manuel, vedi
 * docs/91_Legal_Audit_And_Roadmap.md). Le righe legate a pagamenti (Purchase/Tip/Payment) vengono
 * cancellate anch'esse per ora: Stripe non è ancora collegato, quindi non c'è denaro reale in
 * gioco. Quando lo sarà, questa scelta va rivista (probabilmente anonimizzazione invece di
 * cancellazione, per motivi fiscali/legali).
 *
 * Le chiamate a R2 restano fuori dalla transazione (sono richieste HTTP esterne, non
 * transazionali): la cancellazione dal database avviene prima, per sempre, e i file su R2 vengono
 * ripuliti subito dopo, stesso ordine già usato in lib/updates.ts.
 */
export async function hardDeleteUser(userId: string): Promise<void> {
  const creator = await prisma.creator.findUnique({ where: { userId }, select: { id: true } });

  const mediaToDelete: { kind: "image" | "video"; key: string }[] = [];

  if (creator) {
    const journeys = await prisma.journey.findMany({
      where: { creatorId: creator.id },
      select: { id: true, coverUrl: true },
    });
    const journeyIds = journeys.map((journey) => journey.id);

    const episodes = await prisma.episode.findMany({
      where: { journeyId: { in: journeyIds } },
      select: { id: true, videoKey: true, posterKey: true },
    });
    const episodeIds = episodes.map((episode) => episode.id);

    const updates = await prisma.update.findMany({
      where: { creatorId: creator.id },
      select: { id: true, type: true, mediaKey: true },
    });
    const updateIds = updates.map((update) => update.id);

    for (const journey of journeys) {
      if (journey.coverUrl) mediaToDelete.push({ kind: "image", key: journey.coverUrl });
    }
    for (const episode of episodes) {
      if (episode.videoKey) mediaToDelete.push({ kind: "video", key: episode.videoKey });
      if (episode.posterKey) mediaToDelete.push({ kind: "image", key: episode.posterKey });
    }
    for (const update of updates) {
      if (update.mediaKey) mediaToDelete.push({ kind: update.type === "VIDEO" ? "video" : "image", key: update.mediaKey });
    }

    const community = await prisma.community.findUnique({ where: { creatorId: creator.id }, select: { id: true } });
    const workshops = await prisma.workshop.findMany({ where: { creatorId: creator.id }, select: { id: true } });
    const events = await prisma.event.findMany({ where: { creatorId: creator.id }, select: { id: true } });
    const digitalProducts = await prisma.digitalProduct.findMany({ where: { creatorId: creator.id }, select: { id: true } });
    const services = await prisma.personalService.findMany({ where: { creatorId: creator.id }, select: { id: true } });
    const workshopIds = workshops.map((row) => row.id);
    const eventIds = events.map((row) => row.id);
    const digitalProductIds = digitalProducts.map((row) => row.id);
    const serviceIds = services.map((row) => row.id);

    await prisma.$transaction([
      // Update linkati da altri creator ai contenuti che stiamo per cancellare: si scollegano,
      // non si cancellano (non sono contenuto di questo utente).
      prisma.update.updateMany({ where: { linkedJourneyId: { in: journeyIds } }, data: { linkedJourneyId: null } }),
      prisma.update.updateMany({ where: { linkedEpisodeId: { in: episodeIds } }, data: { linkedEpisodeId: null } }),

      // Update propri: i figli (voti, risposte, reazioni, opzioni sondaggio, visualizzazioni)
      // spariscono da soli via cascade a livello database, stesso meccanismo di lib/updates.ts.
      prisma.update.deleteMany({ where: { id: { in: updateIds } } }),

      prisma.like.deleteMany({ where: { targetType: "UPDATE", targetId: { in: updateIds } } }),
      prisma.like.deleteMany({ where: { targetType: "EPISODE", targetId: { in: episodeIds } } }),
      prisma.episodeProgress.deleteMany({ where: { episodeId: { in: episodeIds } } }),
      prisma.episode.deleteMany({ where: { journeyId: { in: journeyIds } } }),
      prisma.chapter.deleteMany({ where: { journeyId: { in: journeyIds } } }),
      prisma.journeyProgress.deleteMany({ where: { journeyId: { in: journeyIds } } }),
      prisma.analytics.deleteMany({ where: { creatorId: creator.id } }),
      prisma.journey.deleteMany({ where: { creatorId: creator.id } }),

      // Monetizzazione (Community/Workshop/Event/DigitalProduct/PersonalService): nessuna
      // funzione dell'app crea ancora righe reali qui (Stripe non collegato), ma si ripulisce
      // comunque per sicurezza referenziale.
      prisma.payment.deleteMany({
        where: {
          purchase: {
            OR: [
              { workshopId: { in: workshopIds } },
              { eventId: { in: eventIds } },
              { digitalProductId: { in: digitalProductIds } },
              { personalServiceId: { in: serviceIds } },
              ...(community ? [{ communityId: community.id }] : []),
            ],
          },
        },
      }),
      prisma.purchase.deleteMany({
        where: {
          OR: [
            { workshopId: { in: workshopIds } },
            { eventId: { in: eventIds } },
            { digitalProductId: { in: digitalProductIds } },
            { personalServiceId: { in: serviceIds } },
            ...(community ? [{ communityId: community.id }] : []),
          ],
        },
      }),
      prisma.discountCode.deleteMany({ where: { creatorId: creator.id } }),
      ...(community ? [prisma.communityMember.deleteMany({ where: { communityId: community.id } })] : []),
      prisma.tip.deleteMany({ where: { creatorId: creator.id } }),
      prisma.workshop.deleteMany({ where: { creatorId: creator.id } }),
      prisma.event.deleteMany({ where: { creatorId: creator.id } }),
      prisma.digitalProduct.deleteMany({ where: { creatorId: creator.id } }),
      prisma.personalService.deleteMany({ where: { creatorId: creator.id } }),
      ...(community ? [prisma.community.delete({ where: { id: community.id } })] : []),

      prisma.creator.delete({ where: { id: creator.id } }),
    ]);
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true, coverUrl: true } });
  if (user?.avatarUrl) mediaToDelete.push({ kind: "image", key: user.avatarUrl });
  if (user?.coverUrl) mediaToDelete.push({ kind: "image", key: user.coverUrl });

  const conversationIds = (
    await prisma.conversation.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      select: { id: true },
    })
  ).map((conversation) => conversation.id);

  const purchaseIds = (
    await prisma.purchase.findMany({ where: { userId }, select: { id: true } })
  ).map((purchase) => purchase.id);

  await prisma.$transaction([
    prisma.message.deleteMany({ where: { conversationId: { in: conversationIds } } }),
    prisma.conversation.deleteMany({ where: { id: { in: conversationIds } } }),

    prisma.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } }),
    prisma.like.deleteMany({ where: { userId } }),
    prisma.notification.deleteMany({ where: { userId } }),
    prisma.updateVote.deleteMany({ where: { userId } }),
    prisma.updateView.deleteMany({ where: { userId } }),
    prisma.updateAnswer.deleteMany({ where: { userId } }),
    prisma.updateReaction.deleteMany({ where: { userId } }),
    prisma.journeyProgress.deleteMany({ where: { userId } }),
    prisma.episodeProgress.deleteMany({ where: { userId } }),
    prisma.communityMember.deleteMany({ where: { userId } }),
    prisma.report.deleteMany({ where: { userId } }),
    prisma.payment.deleteMany({ where: { purchaseId: { in: purchaseIds } } }),
    prisma.purchase.deleteMany({ where: { userId } }),
    prisma.tip.deleteMany({ where: { userId } }),

    prisma.user.delete({ where: { id: userId } }),
  ]);

  await Promise.all(
    mediaToDelete.map((media) => (media.kind === "video" ? deleteVideo(media.key) : deleteImage(media.key)))
  );
}
