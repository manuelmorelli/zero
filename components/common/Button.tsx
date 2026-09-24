import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function ButtonPrimary({ children, className, href, ...rest }: ButtonProps) {
  // Sweep di luce continuo (esperimento "design più vivo"): pseudo-elemento via utility
  // arbitrarie di Tailwind, nessun markup extra, nessuna libreria aggiunta.
  const classes = `relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md bg-ink px-6 py-3 text-sm font-semibold text-bg transition-all duration-300 hover:opacity-90 hover:shadow-[0_0_30px_-8px_oklch(1_0_0/40%)] after:absolute after:inset-y-0 after:left-[-160%] after:w-1/2 after:animate-[shimmer-sweep_3.2s_ease-in-out_infinite] after:bg-[linear-gradient(115deg,transparent,oklch(1_0_0/35%),transparent)] after:content-[''] ${className ?? ""}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button {...rest} className={classes}>
      {children}
    </button>
  );
}

export function ButtonSecondary({ children, className, href, ...rest }: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-md border border-ember/35 bg-ember/[0.08] px-6 py-3 text-sm font-semibold text-ink shadow-[0_0_20px_-10px_oklch(0.769_0.155_70.5_/_45%)] transition-all duration-300 hover:border-ember/70 hover:bg-ember/[0.15] hover:shadow-[0_0_28px_-8px_oklch(0.769_0.155_70.5_/_70%)] ${className ?? ""}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button {...rest} className={classes}>
      {children}
    </button>
  );
}
