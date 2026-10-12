// Il trailer di un episodio (hooks/useMomentsTrailer.ts): la durata TOTALE è fissa e uguale per
// tutti (decisione di Manuel, 2026-10-12, per evitare che chi segna più punti resti in video più a
// lungo di chi ne segna pochi): il tempo di ogni singolo momento si ricava dividendo
// TOTAL_TRAILER_SECONDS per quanti punti il creator ha segnato a mano (stellina nel player,
// lib/actions/episodeMoments.ts) — più punti, tagli più corti, stesso tempo totale per chiunque.
// MIN è solo il minimo tecnico perché "saltare tra i momenti" abbia senso (sotto 2 punti non c'è
// nessun salto), MAX solo un tetto largo per non far crescere la lista all'infinito.
export const TOTAL_TRAILER_SECONDS = 30;
export const MIN_MANUAL_HIGHLIGHTS = 2;
export const MAX_MANUAL_HIGHLIGHTS = 10;
// Distanza minima tra due momenti segnati a mano (verificata di persona da Manuel, 2026-10-12):
// con solo 2 punti ogni taglio dura TOTAL_TRAILER_SECONDS / MIN_MANUAL_HIGHLIGHTS = 15 secondi, il
// caso peggiore. Due punti più vicini di così farebbero sovrapporre i due tagli (lo stesso pezzo di
// video ripetuto) sia nel trailer dal vivo (hooks/useMomentsTrailer.ts) sia nel video della Home
// (scripts/make-hero-clip.ts).
export const MIN_HIGHLIGHT_GAP_SECONDS = TOTAL_TRAILER_SECONDS / MIN_MANUAL_HIGHLIGHTS;
