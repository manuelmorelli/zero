import { cn } from "@/lib/utils";

/*
 * Titoli ufficiali del sito (scelte di Manuel 4B, 5A, 6E, 7B, 8C, 2026-09-29). Nessun h1/h2/h3
 * con stile proprio fuori da components/ui/: il controllo automatico lo blocca. `as` cambia solo
 * il livello del titolo per chi legge con uno screen reader, mai l'aspetto.
 */

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span";

type HeadingProps = {
  as?: HeadingTag;
  className?: string;
  id?: string;
  children: React.ReactNode;
};

function make(defaultTag: HeadingTag, style: string) {
  return function Heading({ as, className, id, children }: HeadingProps) {
    const Tag = as ?? defaultTag;
    return (
      <Tag id={id} className={cn(style, className)}>
        {children}
      </Tag>
    );
  };
}

/** Titolo in cima alle pagine normali (Impostazioni, Dashboard, Messaggi, Login...). */
export const PageTitle = make("h1", "text-2xl font-extrabold tracking-tight text-ink");

/** Titolone delle pagine di presentazione e legali. Le parole arancioni sono sempre piene. */
export const DisplayTitle = make("h1", "text-5xl font-black leading-[0.9] tracking-tight text-ink sm:text-6xl");

/** Titolo che apre una sezione della pagina (Episodes, About, Top Journeys...). */
export const SectionTitle = make("h2", "text-lg font-bold tracking-tight text-ink");

/** Titolo di sezione arancione delle pagine di lettura (How it works, legali, Linee guida). */
export const ReadingTitle = make("h2", "text-reading font-bold tracking-tight text-ember sm:text-reading-lg");

/** Titolo dentro le card e i riquadri. */
export const CardTitle = make("h3", "text-lg font-bold leading-tight text-ink");
