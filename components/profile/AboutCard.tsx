type AboutCardProps = {
  name: string;
  bio: string | null;
  /** Interessi reali dichiarati dalla persona (User.interests, stessa lista di lib/constants/categories.ts). */
  interests?: string[];
  /** Sovrapposta alla foto di copertina nell'Hero del Profilo (solo desktop): sfondo semi-trasparente
   * sfocato invece del riquadro pieno, stesso stile già usato per il pannello Updates nella Hero della Home. */
  transparent?: boolean;
};

// Volutamente nessun link a social esterni (Instagram/YouTube/X): il traffico resta sulla
// piattaforma, decisione di prodotto esplicita per questa card.
export function AboutCard({ name, bio, interests, transparent }: AboutCardProps) {
  return (
    <div
      className={
        transparent
          ? "rounded-2xl border border-white/10 bg-black/40 p-5 shadow-2xl shadow-black/50 backdrop-blur-md"
          : "rounded-xl border border-border bg-surface p-5"
      }
    >
      <h2 className="text-sm font-bold text-ink">About {name}</h2>
      {bio ? (
        <p className="mt-3 whitespace-pre-wrap break-words text-sm text-ink-muted">{bio}</p>
      ) : (
        <p className="mt-3 text-sm text-ink-faint">{name} hasn&apos;t written a bio yet.</p>
      )}
      {interests && interests.length > 0 && (
        <div className="mt-4">
          <p className="text-[0.65rem] uppercase tracking-wider text-ink-faint">Focus</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-border px-2.5 py-1 text-[0.7rem] text-ink-muted"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
