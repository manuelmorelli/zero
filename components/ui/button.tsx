import Link from "next/link";
import { cn } from "@/lib/utils";

/*
 * Bottoni ufficiali del sito (scelte di Manuel 1C e 2B, 2026-09-29). Nessun altro bottone con
 * sfondo, bordo o forma propria è ammesso fuori da components/ui/: il controllo automatico
 * (scripts/check-design.mjs) lo blocca. Il className dei chiamanti serve solo per il layout
 * (larghezza, margini), mai per cambiare colori o misure.
 */

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 active:scale-[0.97] active:duration-150 disabled:pointer-events-none disabled:opacity-50";

export const BUTTON_VARIANTS = {
  /** Azione principale: arancione tondo con bagliore. Manuel non vuole bottoni bianchi
   * (2026-10-12): primary e secondary sono volutamente lo stesso aspetto, "Explore Journeys" /
   * "Create Your Journey" nella Hero. */
  primary: `${BASE} border border-ember-line bg-ember-soft px-6 py-2.5 text-ink shadow-glow hover:border-ember`,
  /** Tutte le azioni secondarie: arancione tondo con bagliore. */
  secondary: `${BASE} border border-ember-line bg-ember-soft px-5 py-2.5 text-ink shadow-glow hover:border-ember`,
  /** Solo per azioni che cancellano qualcosa: rosso, testo scuro per leggerlo bene. */
  danger: `${BASE} bg-danger px-5 py-2.5 text-bg hover:opacity-90`,
  /** Bottone tondo con sola icona (chiudi, scorri, menu). */
  icon: "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-ink-muted transition-all hover:border-ember-line hover:text-ember active:scale-95 active:duration-150 disabled:pointer-events-none disabled:opacity-50",
  /** Bottone tondo con bordo arancione acceso sempre, non solo all'hover (icon normale):
   * per l'assistente AI nell'header, deve farsi notare anche da fermo. */
  mascot: "grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ember bg-surface shadow-glow transition-transform hover:scale-110 active:scale-95",
  /** Azione testuale senza forma di bottone (es. "Mark All as Read", "View all"). */
  text: "inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors hover:text-ember disabled:pointer-events-none disabled:opacity-50",
  /** Icona "fantasma" dentro una barra già bordata (es. la scrittura della chat AI): niente
   * bordo/sfondo propri a riposo, solo al passaggio del mouse, per non creare un riquadro dentro
   * un altro riquadro. */
  ghostIcon: "grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-50",
  /** Stessa icona fantasma, più piccola: per i tasti sotto una risposta dell'AI (Copy, Regenerate). */
  ghostIconSmall: "grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40",
  /** Icona tonda piena, per l'invio dentro la barra di scrittura della chat. */
  sendRound: "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-bg transition-colors hover:bg-ink-muted disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-faint",
  /** Icona tonda piena arancione, per lo stato attivo dentro la barra di scrittura (es. "sto
   * ascoltando" della dettatura). */
  activeRound: "grid h-10 w-10 shrink-0 animate-pulse place-items-center rounded-full bg-ember text-bg",
  /** Pillola bianca piena sopra una foto o un video (es. il link di un Update nella Story): on-photo
   * resta bianco in ogni tema, a differenza di ink. */
  onPhoto: `${BASE} bg-on-photo px-4 py-2 text-bg hover:opacity-90`,
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

type ButtonProps = {
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  children: React.ReactNode;
  /** Solo per i link (prop href): apertura in nuova scheda e attributi di sicurezza. */
  target?: string;
  rel?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = "primary", href, className, children, type = "button", ...rest }: ButtonProps) {
  const classes = cn(BUTTON_VARIANTS[variant], className);

  if (href) {
    // Gli attributi extra (onClick, aria-*, target...) valgono anche per il link.
    return (
      <Link href={href} className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} {...rest} className={classes}>
      {children}
    </button>
  );
}

export function ButtonPrimary(props: Omit<ButtonProps, "variant">) {
  return <Button variant="primary" {...props} />;
}

export function ButtonSecondary(props: Omit<ButtonProps, "variant">) {
  return <Button variant="secondary" {...props} />;
}

export function ButtonDanger(props: Omit<ButtonProps, "variant">) {
  return <Button variant="danger" {...props} />;
}

export function IconButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="icon" {...props} />;
}

export function TextButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="text" {...props} />;
}
