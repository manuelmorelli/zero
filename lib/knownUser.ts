/** Nome e email dell'ultima persona che ha avuto una sessione valida su questo browser, salvati
 * solo lato client (localStorage): servono a far riconoscere chi è a chi torna sulla pagina di
 * Sign in dopo essersi disconnesso, invece di mostrare sempre un modulo vuoto (richiesta di
 * Manuel, 2026-11-03, come fanno i siti che "ricordano" l'ultimo account usato su un browser). */

const KEY = "zero_known_user";

export type KnownUser = { name: string; email: string };

export function readKnownUser(): KnownUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.name === "string" && typeof parsed?.email === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeKnownUser(user: KnownUser): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    // localStorage non disponibile (privacy mode...): niente di grave, semplicemente non si
    // ricorderà chi è al prossimo Sign in.
  }
}

export function clearKnownUser(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // vedi sopra
  }
}
