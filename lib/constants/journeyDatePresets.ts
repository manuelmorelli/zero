// File separato apposta: nessuna dipendenza da Prisma o altro codice server-only, così un
// componente client (es. components/search/SearchFilters.tsx) può importarlo senza trascinarsi
// dietro l'intero modulo lib/search/searchJourneys.ts (che importa il client Prisma e non può
// girare nel browser — causava un errore di build/runtime reale sulla pagina /search).
export const JOURNEY_DATE_PRESETS = ["today", "week", "month", "year"] as const;
export type JourneyDatePreset = (typeof JOURNEY_DATE_PRESETS)[number];
