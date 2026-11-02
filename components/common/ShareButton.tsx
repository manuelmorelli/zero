"use client";

import { Send } from "lucide-react";
import { useShareActions } from "@/hooks/useShareActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ShareButtonProps = {
  /** Percorso pubblico da copiare/condividere, es. "/journeys/abc". */
  path: string;
  /** Titolo mostrato nei toast e passato alla condivisione nativa del sistema. */
  label: string;
  /** Didascalia già pronta per "Add to your Update" — diversa se il contenuto è proprio o di un
   * altro creator, decisa da chi usa questo componente (vedi ShareButton nella pagina Journey/
   * Player e nelle card episodio). */
  updateCaption: string;
  linkedJourneyId?: string;
  linkedEpisodeId?: string;
  className?: string;
  /** Per chi vuole un'icona più grande del trigger senza toccare le altre (es. riga mobile
   * della pagina Episodio). Facoltativo, default invariato ovunque. */
  iconClassName?: string;
};

/**
 * Pulsante di condivisione unico in tutto il sito, sostituisce il vecchio ShareIconButton: un
 * aereoplanino (stile Instagram) che apre tre scelte — aggiungere al proprio Update (un repost,
 * funziona anche su contenuto di un altro creator, non solo il proprio), copiare il link, o
 * aprire la condivisione nativa del sistema operativo verso altre app.
 */
export function ShareButton({
  path,
  label,
  updateCaption,
  linkedJourneyId,
  linkedEpisodeId,
  className,
  iconClassName,
}: ShareButtonProps) {
  const { sharing, canNativeShare, handleAddToUpdate, handleCopyLink, handleNativeShare } = useShareActions({
    path,
    label,
    updateCaption,
    linkedJourneyId,
    linkedEpisodeId,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(event) => event.stopPropagation()}
        aria-label={`Share ${label}`}
        className={
          className ??
          "grid h-7 w-7 place-items-center rounded-full border border-border bg-scrim text-ember backdrop-blur-md transition-colors hover:bg-scrim"
        }
      >
        <Send className={iconClassName ?? "h-3.5 w-3.5"} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem disabled={sharing} onSelect={handleAddToUpdate}>
          <Send className="h-4 w-4" aria-hidden="true" />
          Add to your Update
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleCopyLink}>Copy Link</DropdownMenuItem>
        {canNativeShare && <DropdownMenuItem onSelect={handleNativeShare}>Share via…</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
