"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal, Pencil, Send, Share2, Trash2 } from "lucide-react";
import { useShareActions } from "@/hooks/useShareActions";
import { deleteEpisode } from "@/lib/actions/episode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type EpisodeCardMenuProps = {
  journeyId: string;
  episodeId: string;
  title: string;
  /** Percorso pubblico dell'episodio, es. "/journeys/abc/episodes/def" — stesso usato da ShareButton. */
  path: string;
  updateCaption: string;
};

/** Menu a tre puntini sulle copertine di "Recent Episodes" nel profilo personale: stesso schema
 * di JourneyCardMenu (il Journey ce l'aveva già, l'episodio no — solo "Condividi"). Qui compare
 * solo per il proprietario (vedi app/(site)/profile/[username]/page.tsx): a un visitatore resta
 * il semplice ShareButton, Modifica/Elimina non lo riguardano. */
export function EpisodeCardMenu({ journeyId, episodeId, title, path, updateCaption }: EpisodeCardMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { canNativeShare, handleAddToUpdate, handleCopyLink, handleNativeShare } = useShareActions({
    path,
    label: title,
    updateCaption,
    linkedEpisodeId: episodeId,
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Manage ${title}`}
          className="grid h-7 w-7 place-items-center rounded-full border border-border bg-scrim text-ember backdrop-blur-md transition-colors hover:bg-scrim"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={canNativeShare ? handleNativeShare : handleCopyLink}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/journeys/${journeyId}?edit=${episodeId}`}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleAddToUpdate}>
            <Send className="h-4 w-4" aria-hidden="true" />
            Add to your Update
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Episode</DialogTitle>
            <DialogDescription>
              {`"${title}" and its video will be deleted for good. This can't be undone.`}
            </DialogDescription>
          </DialogHeader>
          <form action={deleteEpisode}>
            <input type="hidden" name="episodeId" value={episodeId} />
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Delete
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
