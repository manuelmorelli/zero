import Link from "next/link";
import { cn } from "@/lib/utils";

/*
 * Bottoni ufficiali del sito (scelte di Manuel 1C e 2B, 2026-09-29). Nessun altro bottone con
 * sfondo, bordo o forma propria è ammesso fuori da components/ui/: il controllo automatico
 * (scripts/check-design.mjs) lo blocca. Il className dei chiamanti serve solo per il layout
 * (larghezza, margini), mai per cambiare colori o misure.
 */

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50";

export const BUTTON_VARIANTS = {
  /** Azione principale: bianco pieno. */
  primary: `${BASE} bg-ink px-6 py-2.5 text-bg hover:opacity-90`,
  /** Tutte le azioni secondarie: arancione tondo con bagliore. */
  secondary: `${BASE} border border-ember-line bg-ember-soft px-5 py-2.5 text-ink shadow-glow hover:border-ember`,
  /** Solo per azioni che cancellano qualcosa: rosso, testo scuro per leggerlo bene. */
  danger: `${BASE} bg-danger px-5 py-2.5 text-bg hover:opacity-90`,
  /** Bottone tondo con sola icona (chiudi, scorri, menu). */
  icon: "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-ink-muted transition-colors hover:border-ember-line hover:text-ember disabled:pointer-events-none disabled:opacity-50",
  /** Azione testuale senza forma di bottone (es. "Mark All as Read", "View all"). */
  text: "inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors hover:text-ember disabled:pointer-events-none disabled:opacity-50",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

type ButtonProps = {
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  children: React.ReactNode;
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
