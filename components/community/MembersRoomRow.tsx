import { HorizontalScrollRow } from "@/components/common/HorizontalScrollRow";
import { Notice } from "@/components/ui/panel";

/** Row of the members room. Empty until the room is built: it says so honestly. */
export function MembersRoomRow({ firstName }: { firstName: string }) {
  return (
    <div className="mt-12">
      <HorizontalScrollRow title="Members room" subtitle={`Written answers from ${firstName} to members.`}>
        <Notice>No messages in the members room yet.</Notice>
      </HorizontalScrollRow>
    </div>
  );
}
