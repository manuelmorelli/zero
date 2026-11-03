export const UPDATE_TEXT_MAX_LENGTH = 500;
export const UPDATE_ANSWER_MAX_LENGTH = 500;

export const POLL_MIN_OPTIONS = 2;
export const POLL_MAX_OPTIONS = 4;
export const POLL_OPTION_MAX_LENGTH = 60;

// Set fisso, non personalizzabile: coerente con "un tocco, non un commento" (decisione presa
// con Manuel per la reazione rapida agli Update).
export const REACTION_EMOJIS = ["❤️", "🔥", "👏", "😂", "😮"] as const;

// Durata di visualizzazione scelta dal creator alla pubblicazione (massimo 1 minuto, deciso con
// Manuel). Si applica a ogni tipo di Update tranne Domanda (resta finché non si risponde/si
// scorre via a mano, components/home/StoryViewer.tsx); per i Video è un tetto massimo, non
// allunga un video più corto del valore scelto.
export const UPDATE_DURATION_MIN_SEC = 1;
export const UPDATE_DURATION_MAX_SEC = 60;
export const UPDATE_DURATION_DEFAULT_SEC = 5;
