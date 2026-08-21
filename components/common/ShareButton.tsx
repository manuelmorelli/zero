"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { shareToUpdate } from "@/lib/actions/update";
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
}: ShareButtonProps) {
  const { data: session } = useSession();
  const [sharing, setSharing] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  function fullUrl() {
    return `${window.location.origin}${path}`;
  }

  async function handleAddToUpdate(event: Event) {
    event.preventDefault();
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setSharing(true);
    const result = await shareToUpdate({ linkedJourneyId, linkedEpisodeId, content: updateCaption });
    setSharing(false);
    if (result.error) toast.error(result.error);
    else toast.success("Added to your Update");
  }

  async function handleCopyLink(event: Event) {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(fullUrl());
      toast.success("Link copied", { description: label });
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  async function handleNativeShare(event: Event) {
    event.preventDefault();
    try {
      await navigator.share({ title: label, url: fullUrl() });
    } catch {
      // L'utente ha annullato o il sistema non ha completato la condivisione: nessun errore da mostrare.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(event) => event.stopPropagation()}
        aria-label={`Share ${label}`}
        className={
          className ??
          "grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-bg/50 text-ember backdrop-blur-md transition-colors hover:bg-bg/80"
        }
      >
        <Send className="h-3.5 w-3.5" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem disabled={sharing} onSelect={handleAddToUpdate}>
          <Send className="h-4 w-4" aria-hidden="true" />
          Add to your Update
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleCopyLink}>Copy link</DropdownMenuItem>
        {canNativeShare && <DropdownMenuItem onSelect={handleNativeShare}>Share via…</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
