"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/** Nome (e avatar) di chi ha creato un Journey, sopra una card che è già tutta un link al Journey:
 * un secondo <a> dentro il primo non è permesso, quindi qui il clic apre il profilo e si ferma lì,
 * senza aprire anche il Journey. Senza userId (card dimostrative) resta testo semplice. */
export function CreatorProfileLink({
  userId,
  className,
  children,
}: {
  userId?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  if (!userId) return <span className={className}>{children}</span>;

  const href = `/profile/${userId}`;
  function open(event: React.SyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
    router.push(href);
  }

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter") open(event);
      }}
      className={cn("cursor-pointer transition-colors hover:text-ember", className)}
    >
      {children}
    </span>
  );
}
