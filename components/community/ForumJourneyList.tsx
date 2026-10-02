import { MessageSquare } from "lucide-react";
import type { ForumJourneyItem } from "@/lib/community/forumJourneys";
import { ListingCard, COMMUNITY_CARD_GRID } from "@/components/community/ListingCard";

/** Elenco dei Journey del creator che hanno un forum: ognuno apre la propria bacheca di
 * discussione (un forum per Journey, V1 volutamente semplice — vedi 94_Product_Backlog.md per
 * l'upgrade a forum diviso per Capitolo). Nessun Journey = sezione invisibile, stessa regola delle
 * altre griglie della pagina Community (mai un riquadro vuoto). */
export function ForumJourneyList({ journeys }: { journeys: ForumJourneyItem[] }) {
  if (journeys.length === 0) return null;

  return (
    <div className={`mt-4 ${COMMUNITY_CARD_GRID}`}>
      {journeys.map((journey) => (
        <ListingCard
          key={journey.id}
          href={`/community/forum/${journey.id}`}
          coverUrl={journey.coverUrl}
          icon={MessageSquare}
          chipLabel="Forum"
          title={journey.title}
          footer={
            <span className="text-sm text-ink-faint">
              {journey.messageCount} {journey.messageCount === 1 ? "message" : "messages"}
            </span>
          }
        />
      ))}
    </div>
  );
}
