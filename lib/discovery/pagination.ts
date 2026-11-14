/** Quante card mostrano le pagine complete (/discover/...) e di quante cresce l'elenco a ogni "Load more". */
export const DISCOVER_PAGE_STEP = 60;
const DISCOVER_PAGE_MAX = 600;

/** Legge `?shown=` dall'indirizzo: sempre un multiplo valido del passo, mai oltre il massimo. */
export function parseShown(raw: string | string[] | undefined): number {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isFinite(value) || value < DISCOVER_PAGE_STEP) return DISCOVER_PAGE_STEP;
  return Math.min(Math.ceil(value / DISCOVER_PAGE_STEP) * DISCOVER_PAGE_STEP, DISCOVER_PAGE_MAX);
}

/** Si chiede una card in più di quelle mostrate: se arriva, esiste ancora altro da caricare. */
export function splitPage<T>(items: T[], shown: number): { visible: T[]; hasMore: boolean } {
  return { visible: items.slice(0, shown), hasMore: items.length > shown && shown < DISCOVER_PAGE_MAX };
}
