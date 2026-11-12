import type { ReactNode } from "react";
import { PenLine } from "lucide-react";
import { CardTitle } from "@/components/ui/heading";
import { CoverChip } from "@/components/ui/cover-card";
import { PANEL_ACCENT } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

type BioPanelProps = {
  name: string;
  bio: string | null;
  /** Interessi reali dichiarati dalla persona (User.interests, stessa lista di lib/constants/categories.ts). */
  interests?: string[];
  /** Card orizzontale del video di presentazione, in fondo al riquadro, sotto i Focus. */
  media?: ReactNode;
  className?: string;
};

/** Riquadro pieno con bio e interessi, solo da computer (hidden sotto md): su telefono la bio
 * vive in BioPreviewCard. Posizionato accanto alla foto di copertina da ProfileHero.
 * Volutamente nessun link a social esterni: il traffico resta sulla piattaforma. */
export function BioPanel({ name, bio, interests, media, className }: BioPanelProps) {
  return (
    <div className={cn(PANEL_ACCENT, "bio-card hidden overflow-y-auto md:flex md:flex-col", className)}>
      <CardTitle as="h2" className="inline-flex items-center gap-1.5 text-ember">
        <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
        Bio
      </CardTitle>
      {bio ? (
        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{bio}</p>
      ) : (
        <p className="mt-3 text-sm text-ink-faint">{name} hasn&apos;t written a bio yet.</p>
      )}
      {/* Focus e video in fondo, attaccati: la bio sta sopra e prende tutto lo spazio che resta. */}
      <div className="mt-auto shrink-0 pt-4">
        {interests && interests.length > 0 && (
          <div className="mb-2.5">
            <p className="text-sm uppercase tracking-wider text-ink-faint">Focus</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <CoverChip key={interest}>{interest}</CoverChip>
              ))}
            </div>
          </div>
        )}
        {media}
      </div>
    </div>
  );
}
