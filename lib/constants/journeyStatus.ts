import { prisma } from "@/lib/prisma";
import type { JourneyStatus } from "@/generated/prisma/client";

/**
 * Durata della Discovery Phase (08_Algorithm.md, "Discovery Phase"): ogni Journey appena
 * pubblicato resta in stato DISCOVERY per 15 giorni, visibile a tutti indipendentemente dagli
 * interessi (sezione "Discovering Now" in Home), prima di passare a PUBLISHED normale.
 */
export const DISCOVERY_PHASE_DAYS = 15;

/**
 * Stati "live" di un Journey: partecipano alle sezioni di Discovery (Home, Categories, Ricerca,
 * Feed, Recommended) e alla pagina pubblica. PUBLISHED sono i Journey che hanno già completato
 * (o saltato) la Discovery Phase; DISCOVERY sono nei primi 15 giorni. Unica fonte di verità per
 * "questo Journey è visibile pubblicamente", da non duplicare come stringa nei singoli file.
 */
export const LIVE_JOURNEY_STATUSES: JourneyStatus[] = ["PUBLISHED", "DISCOVERY"];

/**
 * Stati la cui pagina pubblica (/journeys/[id]) e la voce sul Profilo restano raggiungibili:
 * oltre ai due stati "live", anche ARCHIVED (sola lettura, mai nelle sezioni di Discovery — vedi
 * 00-project-context.md, "Archiviazione del Journey").
 */
export const PUBLICLY_REACHABLE_JOURNEY_STATUSES: JourneyStatus[] = ["PUBLISHED", "DISCOVERY", "ARCHIVED"];

export function isLiveJourneyStatus(status: string): boolean {
  return (LIVE_JOURNEY_STATUSES as string[]).includes(status);
}

export function isPubliclyReachableJourneyStatus(status: string): boolean {
  return (PUBLICLY_REACHABLE_JOURNEY_STATUSES as string[]).includes(status);
}

/**
 * Un Journey resta in Discovery Phase 15 giorni dalla prima pubblicazione (discoveryEndsAt,
 * valorizzato una sola volta in `publishJourney` — mai ricalcolato, così un ciclo bozza→ripubblica
 * non riapre una seconda Discovery Phase). Nessun cron job: la transizione a PUBLISHED avviene qui,
 * come effetto collaterale delle normali letture pubbliche, stesso principio già in uso per la
 * scadenza degli Updates (vedi `deleteExpiredUpdates` in lib/updates.ts).
 */
export async function promoteExpiredDiscoveryJourneys(): Promise<void> {
  await prisma.journey.updateMany({
    where: { status: "DISCOVERY", discoveryEndsAt: { lte: new Date() } },
    data: { status: "PUBLISHED" },
  });
}
