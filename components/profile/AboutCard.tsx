import { PenLine } from "lucide-react";
import { CardTitle } from "@/components/ui/heading";
import { CoverChip } from "@/components/ui/cover-card";
import { PANEL_ACCENT } from "@/components/ui/panel";
import { BioPreviewCard } from "@/components/profile/BioPreviewCard";
import { cn } from "@/lib/utils";

type AboutCardProps = {
  /** Serve al link della versione mobile, verso la pagina dedicata Bio & presentation. */
  profileUserId: string;
  name: string;
  bio: string | null;
  /** Interessi reali dichiarati dalla persona (User.interests, stessa lista di lib/constants/categories.ts). */
  interests?: string[];
};

// Volutamente nessun link a social esterni (Instagram/YouTube/X): il traffico resta sulla
// piattaforma, decisione di prodotto esplicita per questa card.
export function AboutCard({ profileUserId, name, bio, interests }: AboutCardProps) {
  return (
    <>
      {/* Su mobile questa card si affianca a "In Progress" (FeaturedJourneySection) nella stessa
       * riga: stesso formato compatto 112/156 di quella, altrimenti la riga si rompe (segnalato
       * da Manuel su un profilo senza ancora un video di presentazione, dove PresentationVideoCard
       * non compare e questa prende il suo posto). Da desktop in su resta il riquadro pieno con
       * bio e interessi, invariato. */}
      <BioPreviewCard profileUserId={profileUserId} name={name} bio={bio} interests={interests} />

      <div
        className={cn(
          PANEL_ACCENT,
          "bio-card relative hidden md:flex md:aspect-[224/152] md:flex-col md:overflow-y-auto md:w-[calc((100%-2rem)/3*2)] md:shrink-0 md:left-[372px] lg:w-[calc((100%-4rem)/5*2)]"
        )}
      >
        <CardTitle as="h2" className="inline-flex items-center gap-1.5 text-ember">
          <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
          Bio
        </CardTitle>
        {bio ? (
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{bio}</p>
        ) : (
          <p className="mt-3 text-sm text-ink-faint">{name} hasn&apos;t written a bio yet.</p>
        )}
        {interests && interests.length > 0 && (
          <div className="mt-4 md:mt-auto">
            <p className="text-sm uppercase tracking-wider text-ink-faint">Focus</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <CoverChip key={interest}>{interest}</CoverChip>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
