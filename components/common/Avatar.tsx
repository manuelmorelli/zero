/** Cerchio con le iniziali di un nome, usato ovunque non c'è (ancora) una vera foto profilo. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border border-border bg-surface-2 text-[0.6rem] font-semibold text-ink-muted ${
        className ?? "h-6 w-6"
      }`}
    >
      {initials}
    </span>
  );
}
