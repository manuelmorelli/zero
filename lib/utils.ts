import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** Le misure di testo su misura (globals.css) vanno dichiarate qui: senza, tailwind-merge le scambia per colori e cancella il colore del testo o la misura vera. */
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["card-title", "section"] }] } },
});

/** Unisce classi Tailwind condizionali risolvendo i conflitti (usato dai componenti shadcn/ui in components/ui/). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats large counts compactly, e.g. 24000 -> "24K". */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(
    value
  );
}

/** Formats a past date as a short relative string, e.g. "2 days ago", "yesterday". */
export function formatRelativeDate(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffDays = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, "month");

  return rtf.format(Math.round(diffMonths / 12), "year");
}
