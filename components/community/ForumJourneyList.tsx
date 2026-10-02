import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import type { ForumJourneyItem } from "@/lib/community/forumJourneys";
import { ROW, Notice } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

/** Elenco dei Journey del creator che hanno un forum: ognuno apre la propria bacheca di
 * discussione (un forum per Journey, V1 volutamente semplice — vedi 94_Product_Backlog.md per
 * l'upgrade a forum diviso per Capitolo). */
export function ForumJourneyList({ journeys }: { journeys: ForumJourneyItem[] }) {
  if (journeys.length === 0) {
    return <Notice className="mt-4">No Journeys published yet, the forum opens with the first one.</Notice>;
  }

  return (
    <ul className="mt-4 space-y-2">
      {journeys.map((journey) => (
        <li key={journey.id}>
          <Link href={`/community/forum/${journey.id}`} className={cn(ROW, "flex items-center gap-3")}>
            <span className="relative aspect-square w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
              {journey.coverUrl ? (
                <Image src={journey.coverUrl} alt="" fill sizes="48px" className="object-cover" />
              ) : (
                <div className="absolute inset-0 cover-placeholder" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{journey.title}</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-muted">
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                {journey.messageCount} {journey.messageCount === 1 ? "message" : "messages"}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
