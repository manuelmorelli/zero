/**
 * Spezza una query in singole parole per la ricerca "alla Google": ogni parola deve comparire
 * da qualche parte nel testo, non importa l'ordine o la vicinanza (a differenza di un semplice
 * `contains` sulla query intera, che richiede la frase esatta come sottostringa consecutiva).
 * Condivisa da searchJourneys/searchCreators/searchPeople, stesso comportamento ovunque.
 */
export function toSearchWords(query: string): string[] {
  return query
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}
