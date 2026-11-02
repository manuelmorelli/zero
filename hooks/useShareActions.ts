"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { shareToUpdate } from "@/lib/actions/update";

type UseShareActionsOptions = {
  path: string;
  label: string;
  updateCaption: string;
  linkedJourneyId?: string;
  linkedEpisodeId?: string;
};

/** Le tre azioni di condivisione (ShareButton), estratte in un hook così possono comparire anche
 * come sottomenu di un altro menu (il tre-puntini di copertina su Journey/Episodio) senza
 * duplicare la logica. */
export function useShareActions({ path, label, updateCaption, linkedJourneyId, linkedEpisodeId }: UseShareActionsOptions) {
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

  return { sharing, canNativeShare, handleAddToUpdate, handleCopyLink, handleNativeShare };
}
