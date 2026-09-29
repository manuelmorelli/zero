"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Send, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteCommunityListing,
  publishCommunityListing,
  unpublishCommunityListing,
} from "@/lib/actions/communityListing";
import type { CommunityListingType } from "@/lib/constants/communityListing";
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

type CommunityListingMenuProps = {
  listingId: string;
  listingType: CommunityListingType;
  title: string;
  status: "DRAFT" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
};

function listingFormData(listingId: string, listingType: CommunityListingType): FormData {
  const formData = new FormData();
  formData.set("listingId", listingId);
  formData.set("listingType", listingType);
  return formData;
}

/** Menu a tre puntini sulla card della lista Community: pubblicare/rimettere in bozza ed
 * eliminare senza dover aprire la pagina di modifica intera, stesso pattern già usato per le
 * card dei Journey (vedi components/profile/JourneyCardMenu.tsx). "Notify your followers" resta
 * fuori di proposito (richiesto da Manuel): è un'azione verso altre persone, non una modifica
 * veloce, meglio lasciarla solo nella pagina di dettaglio. */
export function CommunityListingMenu({ listingId, listingType, title, status }: CommunityListingMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handlePublish() {
    startTransition(async () => {
      const result = await publishCommunityListing({ error: null }, listingFormData(listingId, listingType));
      if (result.error) toast.error(result.error);
      else {
        toast.success("Published", { description: title });
        router.refresh();
      }
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      const result = await unpublishCommunityListing({ error: null }, listingFormData(listingId, listingType));
      if (result.error) toast.error(result.error);
      else {
        toast.success("Moved back to Draft", { description: title });
        router.refresh();
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Manage ${title}`}
          className="grid h-7 w-7 place-items-center rounded-full border border-border bg-scrim text-ink backdrop-blur-md transition-colors hover:bg-scrim"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/community/${listingType}/${listingId}`}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          </DropdownMenuItem>
          {status === "DRAFT" && (
            <DropdownMenuItem disabled={pending} onSelect={handlePublish}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Publish
            </DropdownMenuItem>
          )}
          {status === "ACTIVE" && (
            <DropdownMenuItem disabled={pending} onSelect={handleUnpublish}>
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              Move back to Draft
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {deleteOpen && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete {title}</DialogTitle>
              <DialogDescription>
                {`"${title}" will be removed for good, including from your public Community page. This can't be undone.`}
              </DialogDescription>
            </DialogHeader>
            <form action={deleteCommunityListing}>
              <input type="hidden" name="listingId" value={listingId} />
              <input type="hidden" name="listingType" value={listingType} />
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
      )}
    </>
  );
}
