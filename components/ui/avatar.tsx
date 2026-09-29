import Image from "next/image";
import { cn } from "@/lib/utils";

/*
 * Foto profilo tonda ufficiale: unica versione del sito (prima ne esistevano tre). Mostra la foto
 * o, se manca, le iniziali. La foto è già ritagliata tonda al caricamento (ImageCropper).
 * Le iniziali usano una grandezza proporzionata al cerchio: sono parte del disegno, non testo
 * da leggere, per questo possono stare sotto text-sm.
 */

const SIZE = {
  xs: "h-5 w-5 text-[0.55rem]",
  sm: "h-7 w-7 text-[0.65rem]",
  md: "h-10 w-10 text-sm",
  xl: "h-16 w-16 text-lg",
} as const;

export type AvatarSize = keyof typeof SIZE;

export function Avatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return (
      <span className={cn("relative block shrink-0 overflow-hidden rounded-full border border-border", SIZE[size], className)}>
        <Image src={avatarUrl} alt="" fill sizes="128px" className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-border bg-surface-2 font-semibold text-ink-muted",
        SIZE[size],
        className
      )}
    >
      {initials}
    </span>
  );
}
