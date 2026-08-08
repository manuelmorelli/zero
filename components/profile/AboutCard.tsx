type AboutCardProps = {
  name: string;
  bio: string | null;
  /** Sovrapposta alla foto di copertina nell'Hero del Profilo (solo desktop): sfondo semi-trasparente
   * sfocato invece del riquadro pieno, stesso stile già usato per il pannello Updates nella Hero della Home. */
  transparent?: boolean;
};

// Volutamente nessun link a social esterni (Instagram/YouTube/X): il traffico resta sulla
// piattaforma, decisione di prodotto esplicita per questa card.
export function AboutCard({ name, bio, transparent }: AboutCardProps) {
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
    </div>
  );
}
