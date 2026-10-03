import { cn } from "@/lib/utils";

/** Etichetta "Contenuto sponsorizzato": mostrata solo quando il creator ha acceso l'interruttore
 * (Episode.isSponsored). Non influenza in alcun modo la classifica, serve solo a informare. */
export function SponsoredLabel({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full border border-border bg-overlay-soft px-2 py-0.5 text-sm font-bold uppercase tracking-wider text-ink-muted",
        className
      )}
    >
      Sponsored content
    </span>
  );
}
