import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

/**
 * Autoritativo per ogni pagina/azione che richiede un profilo Creator: lo crea al volo se non
 * esiste ancora, invece di rimandare a una schermata di iscrizione separata. "Creator" non è una
 * categoria di utenti a parte con una propria pagina di iscrizione, ma semplicemente lo stato di
 * chi ha deciso di pubblicare qualcosa — decisione di prodotto permanente (00-project-context.md,
 * sezione "Modello utente unico"). Stesso principio già in uso da `quickStartJourney`
 * (lib/actions/journey.ts) per il percorso rapido del pulsante "+".
 */
export async function requireCreator() {
  const { user } = await requireSession();

  const creator =
    (await prisma.creator.findUnique({ where: { userId: user.id } })) ??
    (await prisma.creator.create({ data: { userId: user.id, displayName: user.name } }));

  return { user, creator };
}
