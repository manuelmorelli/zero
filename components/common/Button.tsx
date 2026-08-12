import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function ButtonPrimary({ children, className, href, ...rest }: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-bg transition-all duration-300 hover:opacity-90 hover:shadow-[0_0_30px_-8px_oklch(1_0_0/40%)] ${className ?? ""}`;

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
  const classes = `inline-flex items-center justify-center gap-2 rounded-md border border-border bg-transparent px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:border-ink/60 hover:bg-ink/5 ${className ?? ""}`;

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
