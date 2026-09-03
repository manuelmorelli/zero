type AvatarProps = {
  name: string;
  avatarUrl: string | null;
  size?: string;
};

/** Riquadro tondo con foto profilo o iniziali, riusato da ChatWindow, MessagesButtonClient e InlineChat. */
export function Avatar({ name, avatarUrl, size = "h-9 w-9" }: AvatarProps) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt="" className={`${size} shrink-0 rounded-full object-cover`} />;
  }
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink-muted`}>
      {initials}
    </span>
  );
}
