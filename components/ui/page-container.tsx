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
} as const;

/** Distanza dalla barra in alto e dal fondo pagina. */
export const PAGE_SPACING = "pb-16 pt-24";

type PageContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  width?: keyof typeof PAGE_WIDTH;
  /** false solo per le pagine che iniziano con un'immagine a tutta larghezza (Home, Profilo). */
  spacing?: boolean;
};

export function PageContainer({ width = "narrow", spacing = true, className, ...rest }: PageContainerProps) {
  return <div className={cn(PAGE_WIDTH[width], spacing && PAGE_SPACING, className)} {...rest} />;
}
