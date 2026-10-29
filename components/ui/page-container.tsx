import { cn } from "@/lib/utils";

/*
 * Contenitore di pagina ufficiale (scelte di Manuel 14A, 15A, 16A, 2026-09-29): due sole
 * larghezze e la stessa distanza dalla barra in alto per ogni pagina.
 */

export const PAGE_WIDTH = {
  /** Pagine con moduli o testo da leggere. */
  narrow: "mx-auto w-full max-w-2xl px-6",
  /** Pagine piene di card. */
  wide: "mx-auto w-full max-w-[1400px] px-5 md:px-8",
  /** Come "wide", ma allineato al bordo della foto rientrata di Hero/ProfileHero
   * (stesso md:inset-x-[4.43%] della foto): usato solo dove il testo deve iniziare
   * esattamente sotto quel bordo, non come contenitore di pagina generico. */
  wideCover: "mx-auto w-full max-w-[1400px] px-5 md:px-[calc(4.43%+2rem)]",
  /** Colonna delle chat AI a schermo intero (Community, Ember): più stretta di "narrow" e senza
   * la distanza standard dalla barra in alto, perché qui lo spazio verticale lo gestisce la chat
   * stessa (barra di scrittura fissa in fondo), non PAGE_SPACING. */
  chat: "mx-auto w-full max-w-3xl px-4",
} as const;

/** Distanza dalla barra in alto e dal fondo pagina. Sotto i 768px il fondo ha margine in più
 * (pb-36 invece di pb-16) per lasciare spazio alla barra di navigazione flottante fissa in
 * basso (BottomNav, assente da tablet in su): senza quel margine l'ultimo elemento di una
 * pagina lunga (es. il pulsante "Save changes" di un modulo, o "Sign out" in Impostazioni)
 * finiva parzialmente nascosto dietro la barra. Il valore tiene conto del caso peggiore reale
 * (iPhone con tacca/home indicator, `env(safe-area-inset-bottom)` ~34px più l'altezza della
 * barra ~60px): un valore calcolato al minimo sui test al computer (senza quella tacca) non
 * bastava su un iPhone vero, confermato da Manuel. */
export const PAGE_SPACING = "pb-36 pt-24 md:pb-16";

type PageContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  width?: keyof typeof PAGE_WIDTH;
  /** false solo per le pagine che iniziano con un'immagine a tutta larghezza (Home, Profilo). */
  spacing?: boolean;
};

export function PageContainer({ width = "narrow", spacing = true, className, ...rest }: PageContainerProps) {
  return <div className={cn(PAGE_WIDTH[width], spacing && PAGE_SPACING, className)} {...rest} />;
}
