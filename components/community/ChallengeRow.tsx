import { HorizontalScrollRow } from "@/components/common/HorizontalScrollRow";
import { Notice } from "@/components/ui/panel";

/** Row of the creator's current challenge. Empty until challenges are built: it says so honestly. */
export function ChallengeRow({ firstName }: { firstName: string }) {
  return (
    <div className="mt-12">
      <HorizontalScrollRow
        title="Walk the Path With Me"
        subtitle={`Challenges ${firstName} runs. Each member takes the same path in their own way.`}
      >
        <Notice>No challenge is running right now.</Notice>
      </HorizontalScrollRow>
    </div>
  );
}
