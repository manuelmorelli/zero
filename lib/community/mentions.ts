// Menzioni "@username" nei messaggi del Forum, stile commenti Instagram. Gli username seguono la
// regola di Settings (lib/actions/settings.ts): minuscole, numeri, "-" e "_", da 3 a 30 caratteri.
// Il carattere prima della @ non può essere una lettera o un numero, così un indirizzo email
// (nome@sito.com) non conta come menzione.
const MENTION_PATTERN = /(^|[^a-zA-Z0-9_-])@([a-zA-Z0-9_-]{3,30})/g;

/** Quante persone diverse un solo messaggio può avvisare: oltre, sarebbe spam. */
export const MAX_MENTIONS_PER_MESSAGE = 10;

export function extractMentionUsernames(text: string): string[] {
  const usernames = new Set<string>();
  for (const match of text.matchAll(MENTION_PATTERN)) {
    usernames.add(match[2].toLowerCase());
    if (usernames.size >= MAX_MENTIONS_PER_MESSAGE) break;
  }
  return [...usernames];
}

export type MentionPart = { kind: "text"; value: string } | { kind: "mention"; username: string };

/** Spezza il testo in pezzi normali e menzioni, per mostrare ogni @username come link al profilo. */
export function splitMentions(text: string): MentionPart[] {
  const parts: MentionPart[] = [];
  let last = 0;
  for (const match of text.matchAll(MENTION_PATTERN)) {
    const start = match.index + match[1].length;
    if (start > last) parts.push({ kind: "text", value: text.slice(last, start) });
    parts.push({ kind: "mention", username: match[2] });
    last = start + 1 + match[2].length;
  }
  if (last < text.length) parts.push({ kind: "text", value: text.slice(last) });
  return parts;
}

/** La parola "@qualcosa" che si sta scrivendo proprio dove c'è il cursore, per i suggerimenti
 * mentre si scrive. null se il cursore non è dentro una menzione. */
export function activeMentionQuery(text: string, cursor: number): { query: string; start: number } | null {
  const match = /(^|[^a-zA-Z0-9_-])@([a-zA-Z0-9_-]{0,30})$/.exec(text.slice(0, cursor));
  if (!match) return null;
  return { query: match[2], start: cursor - match[2].length - 1 };
}
