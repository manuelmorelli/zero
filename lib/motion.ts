/**
 * Valori della Regola di Movimento (docs/21_Motion_Guidelines.md), approvata da Manuel il
 * 2026-10-07, aggiornata il 2026-10-12. Un solo posto dove leggerli prima di far muovere
 * qualcosa di nuovo.
 *
 * Il controllo automatico (scripts/check-design.mjs) non può leggere questo file (legge il
 * codice come testo, non lo esegue), quindi tiene la sua copia di questi stessi valori da
 * confrontare. Se un valore approvato cambia, va aggiornato in entrambi i posti.
 */

/** L'unica curva ammessa: gli elementi arrivano e rallentano, mai rimbalzi o elastico. */
export const MOTION_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Le quattro fasce di durata del documento: ogni animazione del sito deve rientrare in una di
 * queste, e il controllo automatico lo verifica davvero (non solo a parole). */
export const MOTION_DURATION_MS = {
  /** Risposte a clic e passaggio del mouse. */
  fast: { min: 150, max: 250 },
  /** Comparse, cambi di frase, righe che salgono. */
  medium: { min: 300, max: 900 },
  /** Dissolvenza tra due video che si alternano (es. i clip di sfondo della Hero). */
  crossfade: { min: 800, max: 1200 },
  /** Sfondo, sabbia, video in loop. */
  slow: { min: 8000, max: 14000 },
} as const;
