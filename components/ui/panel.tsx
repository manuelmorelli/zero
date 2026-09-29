import { cn } from "@/lib/utils";

/*
 * Riquadri ufficiali (scelte di Manuel 9B, 10A, C7B, 2026-09-29). Nessun contenitore con
 * sfondo/bordo/angoli propri fuori da components/ui/: il controllo automatico lo blocca.
 */

export const PANEL = "rounded-2xl border border-border bg-surface p-5";
/** Stesso riquadro con il bordo arancione, per metterlo in risalto (ex riquadri arancioni). */
export const PANEL_ACCENT = "rounded-2xl border border-ember-line bg-surface p-5";
export const NOTICE = "rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-muted";
/** Etichetta tonda (stato, categoria, conteggi) su sfondo normale. */
export const BADGE = "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm font-semibold text-ink-muted";

type BoxProps = React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article" | "aside" | "li" | "form";
  accent?: boolean;
};

/** Riquadro contenitore: raccoglie un gruppo di cose (impostazioni, pannelli Dashboard...). */
export function Panel({ as: Tag = "div", accent, className, ...rest }: BoxProps) {
  return <Tag className={cn(accent ? PANEL_ACCENT : PANEL, className)} {...rest} />;
}

/** Messaggio informativo: frase grigia quando non c'è niente da mostrare o per un avviso. */
export function Notice({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(NOTICE, className)} {...rest} />;
}

export function Badge({ className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn(BADGE, className)} {...rest} />;
}

/** Etichetta cliccabile (categorie, interessi, filtri). */
export const CHIP =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink-muted disabled:opacity-50";
/** Stessa etichetta quando è selezionata. */
export const CHIP_SELECTED =
  "inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3 py-1.5 text-sm font-medium text-bg transition-colors disabled:opacity-50";

/** Riquadro di avviso importante (regole vietate, cancellazioni). */
export const PANEL_DANGER = "rounded-2xl border border-danger-line bg-danger-soft p-5";
/** Riquadro tratteggiato: spazi vuoti da riempire (carica un file, aggiungi qualcosa). */
export const PANEL_DASHED = "rounded-2xl border border-dashed border-border p-5";
/** Riga cliccabile dentro un elenco (miniatura + testo): stesso bordo dei riquadri, meno spazio interno. */
export const ROW = "rounded-xl border border-border bg-surface p-2 transition-colors hover:border-ink-muted";
