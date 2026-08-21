/** Una cifra della riga statistiche del Profilo (Trust Score, Journeys, Followers, Following).
 * Condiviso tra ProfileHero (Server Component) e ProfileFollowStats (Client Component, per
 * rendere cliccabili Followers/Following): nessuna direttiva "use client" qui, è puro markup. */
export function Stat({
  label,
  value,
  ember,
  onClick,
}: {
  label: string;
  value: string;
  ember?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <p className={`text-sm font-bold tracking-tight md:text-base ${ember ? "text-ember" : "text-ink"}`}>{value}</p>
      <p className="text-[0.6rem] font-medium uppercase tracking-wider text-ink-faint">{label}</p>
    </>
  );

  if (onClick) {
    return (
      <li className="text-center">
        <button type="button" onClick={onClick} className="w-full transition-opacity hover:opacity-75">
          {content}
        </button>
      </li>
    );
  }

  return <li className="text-center">{content}</li>;
}
