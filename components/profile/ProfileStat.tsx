/** Una cifra della riga statistiche del Profilo (Trust Score, Journeys, Followers, Following).
 * Condiviso tra ProfileHero (Server Component) e ProfileFollowStats (Client Component, per
 * rendere cliccabili Followers/Following): nessuna direttiva "use client" qui, è puro markup. */
export function Stat({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <p className="text-sm font-bold tracking-tight text-ember md:text-base">{value}</p>
      <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">{label}</p>
    </>
  );

  if (onClick) {
    return (
      <li className="text-center">
        <button type="button" onClick={onClick} className="w-full transition duration-300 hover:scale-110 hover:brightness-125">
          {content}
        </button>
      </li>
    );
  }

  return <li className="text-center">{content}</li>;
}
