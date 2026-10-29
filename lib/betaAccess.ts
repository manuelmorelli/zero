/** Nome del cookie che sblocca l'accesso durante la beta privata su invito (vedi proxy.ts e
 * lib/actions/betaAccess.ts). File separato perché i file "use server" possono esportare solo
 * funzioni async, non una costante. */
export const BETA_ACCESS_COOKIE = "zero-beta-access";

/** Spento di default (nessuna variabile = sito normale, registrazioni aperte). Accesa su Vercel
 * durante la beta su invito: chi entra con il codice (BETA_ACCESS_COOKIE sopra) può navigare e
 * guardare, ma non può crearsi un account, quindi nemmeno pubblicare o caricare video (richiede
 * un account). Controllato sia in app/register/page.tsx (il modulo non viene mostrato) sia in
 * proxy.ts (blocco diretto della chiamata di sign-up, anche bypassando l'interfaccia). */
export function isRegistrationDisabled(): boolean {
  return process.env.DISABLE_REGISTRATION === "true";
}
