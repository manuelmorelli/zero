import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { ROW } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

/** Riga per aprire/moderare il forum di un Journey dalla Dashboard: stesso involucro visivo di
 * CommunityListingRow (miniatura + testo), ma porta dritto al forum pubblico invece che a una
 * pagina di modifica — lì il creator legge i messaggi e può già cancellarne qualunque uno
 * (lib/actions/forum.ts). */
export function ForumListingRow({
  id,
  title,
  coverUrl,
  messageCount,
}: {
  id: string;
  title: string;
  coverUrl: string | null;
  messageCount: number;
}) {
  return (
    <Link href={`/community/forum/${id}`} className={cn(ROW, "flex w-full max-w-[420px] items-center gap-3 p-2")}>
      <span className="relative aspect-4/3 w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-surface sm:w-44">
        {coverUrl ? (
          <Image src={coverUrl} alt="" fill sizes="176px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 cover-placeholder" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{title}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-muted">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
          {messageCount} {messageCount === 1 ? "message" : "messages"}
        </p>
      </span>
    </Link>
  );
}
