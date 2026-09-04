import Image from "next/image";

/** Cerchio con la foto profilo, o le iniziali di un nome quando non c'è (ancora) una vera foto
 * — stesso cerchio in entrambi i casi, cambia solo il contenuto. La foto è già ritagliata
 * quadrata/rotonda al momento del caricamento (vedi ImageCropper in EditProfileButton.tsx), quindi
 * va bene sia nei cerchietti piccoli delle liste sia in quello grande dell'intestazione Profilo. */
export function Avatar({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClassName = className ?? "h-6 w-6";

  if (avatarUrl) {
    return (
      <span className={`relative block shrink-0 overflow-hidden rounded-full border border-border ${sizeClassName}`}>
        <Image src={avatarUrl} alt="" fill sizes="128px" className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border border-border bg-surface-2 text-[0.6rem] font-semibold text-ink-muted ${sizeClassName}`}
    >
      {initials}
    </span>
  );
}
