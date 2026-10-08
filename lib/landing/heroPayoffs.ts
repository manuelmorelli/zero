/**
 * Frasi a rotazione nel titolo della Hero (scelte da Manuel il 2026-10-07, vedi
 * docs/21_Motion_Guidelines.md). La prima è la frase di Zero e apre sempre la rotazione: è anche
 * l'unica che vede chi ha chiesto meno movimento. Le citazioni sono solo il testo, senza autore
 * e senza trattini. Come nella frase di Zero, la parte finale è in arancione pieno.
 */
export type HeroPayoff = {
  text: string;
  accent: string;
};

export const HERO_PAYOFFS: HeroPayoff[] = [
  { text: "Because the destination is only part of", accent: "the story." },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but", accent: "a habit." },
  { text: "The quality of a person's life depends on", accent: "the quality of their actions." },
  { text: "The seed is the beginning of the tree, but it is not yet", accent: "the tree." },
  { text: "Nothing is permanent except", accent: "change." },
  { text: "The unexamined life is", accent: "not worth living." },
  { text: "He who has a why to live can bear", accent: "almost any how." },
  { text: "Life is a journey,", accent: "not a destination." },
];

/** Ogni quanto cambia la frase. La card a destra no: segue il video (o la foto su telefono). */
export const HERO_PAYOFF_MS = 11000;
