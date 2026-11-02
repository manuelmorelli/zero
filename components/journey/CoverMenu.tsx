"use client";

import Link from "next/link";
import { Flag, MessageSquare, MoreHorizontal, Pencil, Send } from "lucide-react";
import { useState } from "react";
import { useShareActions } from "@/hooks/useShareActions";
import { ReportButton } from "@/components/common/ReportButton";
import type { ReportTargetType } from "@/generated/prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ShareConfig = {
  path: string;
  label: string;
  updateCaption: string;
  linkedJourneyId?: string;
  linkedEpisodeId?: string;
};

type CoverMenuProps = {
  /** Presente solo sulla copertina Journey: sull'Episodio Condividi resta in riga 1, non qui. */
  share?: ShareConfig;
  forumHref?: string;
  report?: { targetType: ReportTargetType; targetId: string };
  editHref?: string;
  editLabel?: string;
  className?: string;
};

/** Menu a tre puntini sopra la copertina (Journey) o il video (Episodio), solo telefono: raccoglie
 * Condividi (solo Journey), Forum, Segnala e il link diretto di modifica in un solo posto invece di
 * icone sparse sulla foto. Da computer non esiste, quelle azioni restano dove sono oggi
 * (hidden md:block gestito da chi lo usa). */
export function CoverMenu({ share, forumHref, report, editHref, editLabel, className }: CoverMenuProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const shareActions = useShareActions(
    share ?? { path: "", label: "", updateCaption: "" }
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(event) => event.stopPropagation()}
          aria-label="More options"
          className={
            className ??
            "grid h-9 w-9 place-items-center rounded-full border border-border bg-scrim text-on-photo backdrop-blur-md transition-colors hover:bg-scrim"
          }
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48" onClick={(event) => event.stopPropagation()}>
          {share && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Send className="h-4 w-4" aria-hidden="true" />
                Share
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem disabled={shareActions.sharing} onSelect={shareActions.handleAddToUpdate}>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Add to your Update
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={shareActions.handleCopyLink}>Copy Link</DropdownMenuItem>
                {shareActions.canNativeShare && (
                  <DropdownMenuItem onSelect={shareActions.handleNativeShare}>Share via…</DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          {forumHref && (
            <DropdownMenuItem asChild>
              <Link href={forumHref}>
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Forum
              </Link>
            </DropdownMenuItem>
          )}
          {report && (
            <DropdownMenuItem onSelect={() => setReportOpen(true)}>
              <Flag className="h-4 w-4" aria-hidden="true" />
              Report
            </DropdownMenuItem>
          )}
          {editHref && (
            <DropdownMenuItem asChild className={share || forumHref || report ? "mt-1 border-t border-border pt-2.5" : ""}>
              <Link href={editHref}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                {editLabel ?? "Edit"}
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {report && (
        <ReportButton targetType={report.targetType} targetId={report.targetId} showTrigger={false} open={reportOpen} onOpenChange={setReportOpen} />
      )}
    </>
  );
}
