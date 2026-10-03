import { MessageSquare } from "lucide-react";
import type { ForumJourneyItem } from "@/lib/community/forumJourneys";
import { ListingCard } from "@/components/community/ListingCard";
import { CARD_ROW_ITEM } from "@/components/ui/cover-card";

/** Una card per Journey con forum, dentro la riga Forum (scorrimento laterale). Ognuna apre la
 * bacheca di quel Journey (un forum per Journey, V1 — vedi 94_Product_Backlog.md). */
export function ForumJourneyList({ journeys }: { journeys: ForumJourneyItem[] }) {
  return (
    <>
      {journeys.map((journey) => (
        <div key={journey.id} className={CARD_ROW_ITEM.event}>
          <ListingCard
            href={`/community/forum/${journey.id}`}
            coverUrl={journey.coverUrl}
            icon={MessageSquare}
            chipLabel="Forum"
            title={journey.title}
            footer={
              <span className="text-base text-ink-muted">
                {journey.messageCount} {journey.messageCount === 1 ? "message" : "messages"}
              </span>
            }
          />
        </div>
      ))}
    </>
  );
}
