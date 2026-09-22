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

export type PublishRequirement = "profile" | "presentation" | "guidelines";

const PUBLISH_REQUIREMENT_LABELS: Record<PublishRequirement, string> = {
  profile: "a complete profile (username, photo and bio)",
  presentation: "your presentation video",
  guidelines: "acceptance of the Community Guidelines",
};

/**
 * Requisiti per poter pubblicare per la prima volta (Punto 6 dell'allineamento, deciso con
 * Manuel il 2026-09-22): profilo compilato, video di presentazione, Community Guidelines
 * accettate. Riguarda solo chi vuole diventare creator, mai chi si limita a guardare — non è
 * collegato a requireSession()/requireCreator(), che restano liberi da questo controllo.
 * Nessun grandfathering: vale anche per gli account creati prima di questa regola.
 */
export async function getPublishReadiness(): Promise<{
  ready: boolean;
  missing: PublishRequirement[];
}> {
  const { user, creator } = await requireCreator();
  const profile = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { username: true, avatarUrl: true, bio: true },
  });

  const missing: PublishRequirement[] = [];
  const hasCompleteProfile = Boolean(profile.username && profile.avatarUrl && profile.bio?.trim());
  if (!hasCompleteProfile) missing.push("profile");
  if (!creator.presentationVideoUrl) missing.push("presentation");
  if (!creator.guidelinesAcceptedAt) missing.push("guidelines");

  return { ready: missing.length === 0, missing };
}

export function publishGateMessage(missing: PublishRequirement[]): string {
  return `Before you can publish, finish becoming a creator: ${missing
    .map((requirement) => PUBLISH_REQUIREMENT_LABELS[requirement])
    .join(", ")}.`;
}
