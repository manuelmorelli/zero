import Link from "next/link";
import { PenLine } from "lucide-react";
import { CoverChip } from "@/components/ui/cover-card";

type BioPreviewCardProps = {
  /** Serve al link verso la pagina dedicata Bio & presentation. */
  profileUserId: string;
  name: string;
  bio: string | null;
  interests?: string[];
};

// Oltre questa lunghezza il testo viene tagliato qui e mostriamo "more": per leggere il resto
// bisogna per forza aprire la pagina dedicata (tutta la card è già cliccabile verso di lì).
const BIO_PREVIEW_INLINE_LIMIT = 180;

/** Card mobile (112/156, stesso formato di "In Progress") con l'anteprima della bio: tocca per
 * andare alla pagina dedicata Bio & presentation. Usata sia da sola (AboutCard, profilo senza
 * video) sia accanto al video di presentazione (PresentationVideoCard). */
export function BioPreviewCard({ profileUserId, name, bio, interests }: BioPreviewCardProps) {
  return (
    <Link
      href={`/profile/${profileUserId}/presentation`}
      className="relative block aspect-[112/156] w-full min-w-0 flex-1 overflow-hidden rounded-xl border border-border cover-placeholder md:hidden"
    >
      <div className="absolute inset-x-0 top-0 p-2.5">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-ember">
          <PenLine className="h-3 w-3" aria-hidden="true" />
          Bio
        </span>
        <p className="mt-1 text-sm text-on-photo-muted">
          {bio
            ? bio.length > BIO_PREVIEW_INLINE_LIMIT
              ? `${bio.slice(0, BIO_PREVIEW_INLINE_LIMIT).trimEnd()}…`
              : bio
            : `${name} hasn't written a bio yet.`}
        </p>
        {bio && bio.length > BIO_PREVIEW_INLINE_LIMIT && (
          <span className="mt-1 inline-block text-sm font-semibold text-on-photo">more</span>
        )}
      </div>

      {interests && interests.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 p-2.5">
          {interests.map((interest) => (
            <CoverChip key={interest}>{interest}</CoverChip>
          ))}
        </div>
      )}
    </Link>
  );
}
