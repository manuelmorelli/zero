import Link from "next/link";
import { PenLine } from "lucide-react";
import { CardTitle } from "@/components/ui/heading";
import { PANEL_ACCENT } from "@/components/ui/panel";
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
       * non compare e questa prende il suo posto). Tocca porta alla pagina dedicata, come l'altra
       * card. Da desktop in su resta il riquadro pieno con bio e interessi, invariato. */}
      <Link
        href={`/profile/${profileUserId}/presentation`}
        className="relative block aspect-[112/156] w-full min-w-0 flex-1 overflow-hidden rounded-xl border border-border cover-placeholder md:hidden"
      >
        <div className="absolute inset-x-0 top-0 p-2.5">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ember">
            <PenLine className="h-3 w-3" aria-hidden="true" />
            Bio
          </span>
          <p className="mt-1 line-clamp-4 text-sm text-on-photo-muted">
            {bio ?? `${name} hasn't written a bio yet.`}
          </p>
        </div>
      </Link>

      <div
        className={cn(
          PANEL_ACCENT,
          "bio-card relative hidden md:flex md:aspect-[224/152] md:flex-col md:overflow-y-auto md:w-[calc((100%-2rem)/3*2)] md:shrink-0 md:left-[502px] lg:w-[calc((100%-4rem)/5*2)]"
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
          <div className="mt-4">
            <p className="text-sm uppercase tracking-wider text-ink-faint">Focus</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-border px-2.5 py-1 text-sm text-ink-muted"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
