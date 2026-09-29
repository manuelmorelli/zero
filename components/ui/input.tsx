import { cn } from "@/lib/utils";

/*
 * Campi ufficiali (scelte di Manuel 11B e 12A, 2026-09-29). Nessun campo con stile proprio
 * fuori da components/ui/: il controllo automatico lo blocca.
 */

/** Campo rettangolare dei moduli (input, textarea, select). */
export const FIELD =
  "w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink-muted disabled:opacity-50";

/** Campo tondo a pillola (ricerca, chat, filtri): contenitore con icona e testo dentro. */
export const PILL_FIELD =
  "flex w-full items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-ink transition-colors focus-within:border-ink-muted";

/** Il testo scritto dentro un PILL_FIELD: nessun bordo/sfondo proprio. */
export const PILL_FIELD_INPUT = "w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn(FIELD, className)} {...props} />;
}

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(FIELD, className)} {...props} />;
}

function PillField({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(PILL_FIELD, className)} {...props} />;
}

export { Input, Select, PillField };

/** Campo tondo sopra una foto o un video (risposta a una domanda nel visore delle storie):
 * stesso ruolo di PILL_FIELD, ma sul vetro traslucido invece che sul grigio della pagina. */
export const PILL_FIELD_ON_PHOTO =
  "flex w-full items-center gap-2 rounded-full border border-border bg-overlay-soft px-4 py-2.5 text-sm text-on-photo outline-none placeholder:text-ink-muted";
